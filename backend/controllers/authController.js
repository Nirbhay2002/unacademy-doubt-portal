const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { users } = require('../users');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

const signup = async (req, res) => {
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
        console.error('signup error:', err);
        res.status(500).json({ error: err.message });
    }
};

const login = async (req, res) => {
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
        console.error('login error:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { signup, login };
