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
const VALID_ROLL_NUMBERS = [
    '252002210', '252006660', '252005263', '252005265', '252005515', '252007475',
    '252008698', '252010156', '252010297', '252011322', '252014093', '252014278',
    '252015004', '252015252', '252015321', '252015798', '252016205', '252013170',
    '252013796', '252016676', '252016695', '252017089', '252017217', '252017192',
    '252017340', '252018004', '252018031', '252018587', '252019373', '242004910',
    '252015536', '252015861', '232021987', '252001535', '252019923', '252019914',
    '252020282', '252020424', '252021045', '252011342', '252021565', '252021748',
    '252021889', '252005066', '252022344', '252017666', '252022609', '252017851',
    '252022772', '252022785', '252023206', '252023438', '252023511', '252023841',
    '252023844', '252023674', '252023891', '252023955', '252023893', '252024020',
    '252024059', '252024295', '252024324', '252024382', '252024496', '252024484',
    '252025145', '252024589', '252005176', '252025008', '252024801', '252024978',
    '252023149', '252025249', '252025309', '252025308', '252025433', '252025458',
    '252025468', '252024716', '252026152', '252027006', '252026984', '252027329',
    '252024093', '252027429', '252027571', '252021108', '252026911', '252015599',
    '252027346', '252025652', '252026756', '252027704', '252028072', '252028490',
    '252028543', '252028258', '252028855', '252028899', '252029009', '252028993',
    '252029046', '252029168', '252017154', '252029348', '252029435', '252029769',
    '252029742', '252029843', '252029875', '252030035', '252030089', '252030336',
    '252030487', '252030697', '252030839', '252031395', '252031419', '252031626',
    '252031805', '252031852', '252032339', '252032942'
];

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

// Delete Single Doubt
app.delete('/api/doubts/:id', authMiddleware, async (req, res) => {
    try {
        const doubt = await Doubt.findById(req.params.id);
        if (!doubt) {
            return res.status(404).json({ error: 'Doubt not found' });
        }

        if (doubt.imagePath) {
            const filePath = path.join(__dirname, doubt.imagePath);
            fs.unlink(filePath, (err) => {
                if (err && err.code !== 'ENOENT') console.error('Error deleting image file:', err);
            });
        }

        await Doubt.findByIdAndDelete(req.params.id);
        res.json({ message: 'Doubt deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Bulk Delete Doubts
app.post('/api/doubts/bulk-delete', authMiddleware, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Invalid or empty array of IDs provided.' });
        }

        const doubtsToDelete = await Doubt.find({ _id: { $in: ids } });

        doubtsToDelete.forEach(doubt => {
            if (doubt.imagePath) {
                const filePath = path.join(__dirname, doubt.imagePath);
                fs.unlink(filePath, (err) => {
                    if (err && err.code !== 'ENOENT') console.error('Error deleting image file:', err);
                });
            }
        });

        const result = await Doubt.deleteMany({ _id: { $in: ids } });
        res.json({ message: `Successfully deleted ${result.deletedCount} doubts` });
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
