const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * @route   POST /api/register
 * @desc    Register a new user
 * @body    { publicId, privateId, password }
 */
router.post('/register', async (req, res) => {
  const { publicId, privateId, password } = req.body;

  //enforces all fields entered.
  if (!publicId || !privateId || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Create user. publicId and privateId are both unique in schema
    const user = new User({ publicId, privateId, password });
    await user.save();
    res.status(201).json({ message: 'Account created successfully' });
  } catch (err) {
    // avoids multiple users having same id.
    if (err.code === 11000) {
      res.status(400).json({ message: 'Public or Private ID already in use' });
    } else {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
});

/**
 * @route   POST /api/login
 * @desc    Log in a user (currently using plaintext)
 * @body    { publicId, password }
 */
router.post('/login', async (req, res) => {
  const { publicId, password } = req.body;

  try {
    const user = await User.findOne({ publicId });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid login credentials' });
    }

    res.json({ message: 'Login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;