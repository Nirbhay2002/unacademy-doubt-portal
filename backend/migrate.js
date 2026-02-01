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

// Define the schema (minimal for migration)
const doubtSchema = new mongoose.Schema({
    studentName: String,
    school: String,
    subject: String,
    imagePath: String
}, { strict: false }); // Allow fields not in schema during migration if needed

const Doubt = mongoose.model('Doubt', doubtSchema);

async function migrate() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected successfully.');

        console.log('Finding documents missing school or subject fields...');

        // Update all documents where school or subject is missing or null
        const result = await Doubt.updateMany(
            { $or: [{ school: { $exists: false } }, { subject: { $exists: false } }] },
            { $set: { school: 'Default School', subject: 'General' } }
        );

        console.log(`Migration complete! Updated ${result.modifiedCount} documents.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
