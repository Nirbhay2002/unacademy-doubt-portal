const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    rollNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, required: true, enum: ['student', 'teacher', 'admin'], default: 'student' },
    password: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);
