const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const router = express.Router();
const bcrypt = require('bcrypt');

router.post('/signup', async (req, res) => {
   try{
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    const hashedPassword = await bcrypt.hash(password, 10);
    if (existingUser) {
        throw new Error('User already exists');
    }
    const user = new User({ username, email, password: hashedPassword });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await user.save();
    res.cookie('token', token, { httpOnly: true });
    res.status(201).json(user);
   }
   catch(err){
    res.status(400).json({ message: err.message });
   }

});

module.exports = router;