const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
    const { first_name, last_name, phone_number, password } = req.body;

    if (!first_name || !last_name || !phone_number || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await User.findOne({ where: { phone_number } });
        if (existingUser) {
            return res.status(400).json({ message: 'Phone number already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ first_name, last_name, phone_number, password: hashedPassword });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    const { phone_number, password } = req.body;

    // Validate input
    if (!phone_number || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const user = await User.findOne({ where: { phone_number } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    register,
    login
};
