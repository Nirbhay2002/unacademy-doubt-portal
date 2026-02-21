const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

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

const subjects = ['Chemistry', 'Mathematics', 'Physics', 'Botany', 'Zoology'];
const school = 'Unacademy, Chandigarh';

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected successfully.');

        console.log('Cleaning up existing doubts...');
        await Doubt.deleteMany({});

        console.log('Seeding new data...');
        const doubts = subjects.map(subject => ({
            studentName: `Sample Student (${subject})`,
            school: school,
            subject: subject,
            imagePath: '/uploads/sample.jpg', // Placeholder image path
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
