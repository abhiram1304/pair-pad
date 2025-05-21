const router = require('express').Router();
const { nanoid } = require('nanoid');
const Room = require('../models/Room');
const jwt  = require('jsonwebtoken');

// middleware: same one from index.js
const { authMiddleware } = require('../utils/auth');   // (see next snippet)

router.post('/', authMiddleware, async (req, res) => {
  // generate a 6-char uppercase code, ensure uniqueness
  let code;
  do { code = nanoid(6).toUpperCase(); }
  while (await Room.findOne({ code }));

  await Room.create({ code, owner: req.user.id });
  res.status(201).json({ code });
});

module.exports = router;
