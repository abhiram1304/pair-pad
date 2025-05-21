const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// GET /api/ping  →  { pong: true }
app.get('/api/ping', (req, res) => {
  res.json({ pong: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
