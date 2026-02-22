const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema({
    studentName: { type: String, required: true },
    school: { type: String, required: true },
    subject: { type: String, required: true },
    imagePath: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Doubt', doubtSchema);
