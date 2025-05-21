/*************************************************************
 * 1. Load environment variables and required libraries
 *************************************************************/
require('dotenv').config();                       // <- reads .env  :contentReference[oaicite:0]{index=0}

const express   = require('express');
const cors      = require('cors');
const mongoose  = require('mongoose');            // Mongo driver  :contentReference[oaicite:1]{index=1}
const jwt       = require('jsonwebtoken');        // JWT helper    :contentReference[oaicite:2]{index=2}

const authRoutes = require('./routes/auth');      // /api/auth/*  (created in Step 5 D)

const app = express();
const roomRoutes = require('./routes/rooms');
app.use('/api/rooms', roomRoutes);


/*************************************************************
 * 2. Global middleware
 *************************************************************/
app.use(cors());                                  // allow requests from the React dev server
app.use(express.json());                          // parse JSON bodies  :contentReference[oaicite:3]{index=3}

/*************************************************************
 * 3. Connect to MongoDB Atlas
 *************************************************************/
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('🗄️  Mongo connected'))
  .catch((err) => console.error('Mongo connection error:', err));  // guard against bad URI

/*************************************************************
 * 4. Utility: JWT-verify middleware (added in Step 5 F)
 *************************************************************/
function authMiddleware(req, res, next) {
  // Grab "Authorization: Bearer <token>" header, if any
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.sendStatus(401);         // no token → Unauthorised

  try {
    // Verify and attach payload (e.g., { id: '...', iat, exp })
    req.user = jwt.verify(token, process.env.JWT_SECRET);  // 401 if expired or bad sig :contentReference[oaicite:4]{index=4}
    next();
  } catch {
    return res.sendStatus(401);
  }
}

/*************************************************************
 * 5. Routes
 *************************************************************/
// simple health-check
app.get('/api/ping', (req, res) => res.json({ pong: true }));

// mount register / login routes from routes/auth.js
app.use('/api/auth', authRoutes);

// Protected demo route
app.get('/api/secure', authMiddleware, (req, res) => {
  res.json({ secret: '✅  You are authenticated', user: req.user });
});

// Friendly root message so hitting http://localhost:3001/ isn’t “Cannot GET /”
app.get('/', (_req, res) => res.send('API is up! Try /api/ping'));

/*************************************************************
 * 6. Boot the server
 *************************************************************/
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`API server running on http://localhost:${PORT}`)
);
