const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const cron = require('node-cron');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student-doubts';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// --- Auth Setup ---
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';
const VALID_ROLL_NUMBERS = ['1001', '1002', '1003', '1004', '1005'];

const userSchema = new mongoose.Schema({
    rollNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Auth Middleware
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
// ------------------

// Doubt Schema
const doubtSchema = new mongoose.Schema({
    studentName: String,
    school: String,
    subject: String,
    imagePath: String,
    createdAt: { type: Date, default: Date.now }
});

const Doubt = mongoose.model('Doubt', doubtSchema);

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- Auth Endpoints ---
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { rollNumber, password } = req.body;

        if (!VALID_ROLL_NUMBERS.includes(rollNumber)) {
            return res.status(400).json({ error: 'Invalid Roll Number. Not allowed to sign up.' });
        }

        const existingUser = await User.findOne({ rollNumber });
        if (existingUser) {
            return res.status(400).json({ error: 'Roll number already registered.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const savedUser = await new User({ rollNumber, password: hashedPassword }).save();
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

        const token = jwt.sign({ _id: user._id, rollNumber: user.rollNumber }, JWT_SECRET, { expiresIn: '12h' });
        res.json({ token, rollNumber: user.rollNumber });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// -----------------------

// API Endpoints
app.post('/api/doubts', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { studentName, school, subject } = req.body;
        const doubt = new Doubt({
            studentName,
            school,
            subject,
            imagePath: req.file ? `/uploads/${req.file.filename}` : ''
        });
        await doubt.save();
        res.status(201).json({ message: 'Doubt uploaded successfully', doubt });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Weekly Cleanup: Every Sunday at Midnight (0 0 * * 0)
cron.schedule('0 0 * * 0', async () => {
    console.log('Running weekly cleanup...');
    try {
        // 1. Delete all database records
        await Doubt.deleteMany({});

        // 2. Delete all files in uploads/ folder
        const directory = path.join(__dirname, 'uploads');
        fs.readdir(directory, (err, files) => {
            if (err) return console.error('Error reading uploads directory for cleanup:', err);
            for (const file of files) {
                fs.unlink(path.join(directory, file), err => {
                    if (err) console.error(`Failed to delete file ${file}:`, err);
                });
            }
        });
        console.log('Weekly cleanup successful.');
    } catch (err) {
        console.error('Cleanup error:', err);
    }
});
