const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const cron = require('node-cron');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const doubtsRoutes = require('./routes/doubts');
const { cloudinary } = require('./utils/cloudinary');
const Doubt = require('./models/Doubt');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — allow Vercel production URL and all preview deployments
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
        else callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    abortOnLimit: true,
    useTempFiles: false
}));

// MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student-doubts')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doubts', doubtsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Global Error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Weekly cleanup — runs every Sunday at midnight
cron.schedule('0 0 * * 0', async () => {
    console.log('Running weekly cleanup...');
    try {
        await Doubt.deleteMany({});
        await cloudinary.api.delete_resources_by_prefix('student-doubts/');
        console.log('Weekly cleanup done.');
    } catch (err) {
        console.error('Cleanup error:', err);
    }
});
