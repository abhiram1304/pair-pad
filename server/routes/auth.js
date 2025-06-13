const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const admin = require('../lib/firebase');  // Firebase Admin SDK

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Missing email or password' });

  const existing = await User.findOne({ email });
  if (existing)
    return res.status(400).json({ error: 'Email already registered' });

  const user = new User({ email, password }); // password will be hashed via Mongoose pre-save
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });

  res.json({ token });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('🔐 Login attempt:', email);

  const user = await User.findOne({ email });
  if (!user) {
    console.log('❌ User not found');
    return res.status(400).json({ error: 'Bad credentials' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: 'Bad credentials' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = await admin.auth().verifyIdToken(token); // Firebase verifies token
    const email = decoded.email;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, password: 'GOOGLE_AUTH' }); // dummy password
    }

    const appToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ token: appToken });
  } catch (err) {
    console.error('[Google Auth] Failed:', err);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

module.exports = router;
