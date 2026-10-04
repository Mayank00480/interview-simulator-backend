const express = require('express');
const User = require('../model/user');
const router = express.Router();
const bcrypt = require('bcrypt');
const validator = require('validator');

router.post('/signup', async (req, res) => {
   try{
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (!validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    })) {
        throw new Error('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    if (existingUser) {
        throw new Error('User already exists');
    }
    const user = new User({ username, email, password: hashedPassword });
    const token = user.generateAuthToken();
    await user.save();
    res.cookie('token', token, { httpOnly: true });
    res.status(201).json(user);
   }
   catch(err){
    res.status(400).json({ message: err.message });
   }
});

  router.post('/login', async (req, res) => {
    try{
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        const token = user.generateAuthToken();
        res.cookie('token', token, { httpOnly: true });
        res.json({ token });
    }
    catch(err){
        res.status(400).json({ message: err.message });
    }
})

module.exports = router;