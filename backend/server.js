const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const dotenv = require('dotenv');
const cron = require('node-cron');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getUserName, users } = require('./users');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Log errors to file + console
const logError = (message, err) => {
    const logEntry = `[${new Date().toISOString()}] ${message}\nError: ${err.message}\nStack: ${err.stack}\n\n`;
    fs.appendFileSync('server_error.log', logEntry);
    console.error(message, err);
};

// CORS — explicitly allow Vercel production and all preview URLs
const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://unacademy-doubt-portal.vercel.app',
    /^https:\/\/unacademy-doubt-portal.*\.vercel\.app$/
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const allowed = ALLOWED_ORIGINS.some(o =>
            typeof o === 'string' ? o === origin : o.test(origin)
        );
        if (allowed) callback(null, true);
        else callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    abortOnLimit: true,
    useTempFiles: false  // keep files in memory as buffers
}));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student-doubts';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Auth Setup
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

const userSchema = new mongoose.Schema({
    rollNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, required: true, enum: ['student', 'teacher', 'admin'], default: 'student' },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

// Doubt Schema
const doubtSchema = new mongoose.Schema({
    studentName: String,
    school: String,
    subject: String,
    imagePath: String,
    createdAt: { type: Date, default: Date.now }
});
const Doubt = mongoose.model('Doubt', doubtSchema);

// Cloudinary Setup
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Delete image from Cloudinary by its stored URL
const deleteFromCloudinary = async (imageUrl) => {
    if (!imageUrl) return;
    try {
        const parts = imageUrl.split('/');
        const filename = parts[parts.length - 1];
        const publicId = `student-doubts/${filename.split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.error('Error deleting from Cloudinary:', err);
    }
};

// --- Auth Endpoints ---
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { rollNumber, password } = req.body;

        const userData = users.find(u => u.rollNumber === rollNumber);
        if (!userData) {
            return res.status(400).json({ error: 'Invalid Roll Number. Not allowed to sign up.' });
        }

        const existingUser = await User.findOne({ rollNumber });
        if (existingUser) {
            return res.status(400).json({ error: 'Roll number already registered.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const savedUser = await new User({
            rollNumber,
            name: userData.name,
            role: userData.role,
            password: hashedPassword
        }).save();
        res.status(201).json({ message: 'User created successfully', userId: savedUser._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { rollNumber, password } = req.body;
        const user = await User.findOne({ rollNumber });

        if (!user) return res.status(400).json({ error: 'Invalid roll number or password.' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid roll number or password.' });

        const token = jwt.sign(
            { _id: user._id, rollNumber: user.rollNumber, name: user.name, role: user.role },
            JWT_SECRET,
            { expiresIn: '12h' }
        );
        res.json({ token, rollNumber: user.rollNumber, name: user.name, role: user.role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Doubt Endpoints ---

// POST /api/doubts — submit a doubt with image upload
app.post('/api/doubts', authMiddleware, async (req, res) => {
    try {
        // express-fileupload attaches uploaded files to req.files
        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const imageFile = req.files.image;

        // Upload to Cloudinary using base64 data URI — no streams, no piping
        const dataUri = `data:${imageFile.mimetype};base64,${imageFile.data.toString('base64')}`;
        const cloudinaryResult = await cloudinary.uploader.upload(dataUri, {
            folder: 'student-doubts',
            resource_type: 'auto'
        });

        const { school, subject } = req.body;
        const studentName = req.user.name || getUserName(req.user.rollNumber);

        const doubt = new Doubt({
            studentName,
            school,
            subject,
            imagePath: cloudinaryResult.secure_url
        });
        await doubt.save();
        res.status(201).json({ message: 'Doubt uploaded successfully', doubt });
    } catch (err) {
        logError('Error in POST /api/doubts:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/doubts — fetch all doubts with optional filters
app.get('/api/doubts', authMiddleware, async (req, res) => {
    try {
        const { school, subject } = req.query;
        let query = {};
        if (school) query.school = school;
        if (subject) query.subject = subject;

        const doubts = await Doubt.find(query).sort({ createdAt: -1 });
        res.json(doubts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/doubts/:id
app.delete('/api/doubts/:id', authMiddleware, async (req, res) => {
    try {
        const doubt = await Doubt.findById(req.params.id);
        if (!doubt) return res.status(404).json({ error: 'Doubt not found' });

        if (doubt.imagePath) await deleteFromCloudinary(doubt.imagePath);
        await Doubt.findByIdAndDelete(req.params.id);
        res.json({ message: 'Doubt deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/doubts/bulk-delete
app.post('/api/doubts/bulk-delete', authMiddleware, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Invalid or empty array of IDs provided.' });
        }

        const doubtsToDelete = await Doubt.find({ _id: { $in: ids } });
        for (const doubt of doubtsToDelete) {
            if (doubt.imagePath) await deleteFromCloudinary(doubt.imagePath);
        }

        const result = await Doubt.deleteMany({ _id: { $in: ids } });
        res.json({ message: `Successfully deleted ${result.deletedCount} doubts` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    logError('Global Error Handler:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Weekly Cleanup: Every Sunday at Midnight
cron.schedule('0 0 * * 0', async () => {
    console.log('Running weekly cleanup...');
    try {
        await Doubt.deleteMany({});
        try {
            await cloudinary.api.delete_resources_by_prefix('student-doubts/');
        } catch (cloudinaryErr) {
            console.error('Error clearing Cloudinary folder:', cloudinaryErr);
        }
        console.log('Weekly cleanup successful.');
    } catch (err) {
        console.error('Cleanup error:', err);
    }
});
