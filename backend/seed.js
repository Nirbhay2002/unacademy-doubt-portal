const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { getUserName } = require('./users');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI not found in .env file');
    process.exit(1);
}

// Define the schema
const doubtSchema = new mongoose.Schema({
    studentName: String,
    school: String,
    subject: String,
    imagePath: String,
    createdAt: { type: Date, default: Date.now }
});

const Doubt = mongoose.model('Doubt', doubtSchema);

const sampleData = [
    { rollNumber: '252002210', subject: 'Physics' },
    { rollNumber: '252006660', subject: 'Mathematics' },
    { rollNumber: '252005263', subject: 'Chemistry' },
    { rollNumber: '252005265', subject: 'Botany' },
    { rollNumber: '252005515', subject: 'Zoology' }
];

const school = 'Unacademy, Chandigarh';
const sampleImage = 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg';

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected successfully.');

        console.log('Cleaning up existing doubts...');
        await Doubt.deleteMany({});

        console.log('Seeding new data...');
        const doubts = sampleData.map(data => ({
            studentName: getUserName(data.rollNumber),
            school: school,
            subject: data.subject,
            imagePath: sampleImage,
            createdAt: new Date()
        }));

        await Doubt.insertMany(doubts);

        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
