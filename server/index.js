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
 * 6. Boot the server (HTTP + WebSocket)
 *************************************************************/
const http = require('http');
const { Server } = require('socket.io');

const srv = http.createServer(app);          // wrap Express
const roomUsers = new Map();
const io  = new Server(srv, {
  cors: { origin: '*' },                     // dev only
});

// ── expose io so route files can emit to sockets ───────────
app.set('io', io);

// ── mount /api/run routes ──────────────────────────────────
const runRoutes = require('./routes/run');  // make sure path is correct
app.use('/api/run', runRoutes);

const presignRoutes = require('./routes/presign');
app.use('/api/presign', presignRoutes);



io.on('connection', (socket) => {
  console.log('[ws] connected', socket.id);

  // client says: join this room code
  socket.on('join-room', (code) => {
    socket.join(code);
    console.log(`[ws] ${socket.id} joined ${code}`); 
  });

  // client sends code change
  socket.on('code-change', ({ code, text, from }) => {
    console.log('[ws] relay to room', code, 'from', from);
    socket.to(code).emit('code-change', { text, from });
  });

  /* ---- live cursor relay -------------------------------------- */

  //  client -> server: "cursor-change" { room, from, position }
  socket.on('cursor-change', ({ room, from, position }) => {
    // forward to everyone else in the room
    socket.to(room).emit('cursor-update', { from, position });
  });


  // relay WebRTC signalling data
  socket.on('video-ready', ({ code, from }) => {
  console.log('[ws] video-ready from', from, 'room', code);
  socket.to(code).emit('video-ready', { from });
  });

  socket.on('video-signal', ({ code, signal, from }) => {
  console.log('[ws] signal from', from, 'room', code);
  socket.to(code).emit('video-signal', { signal, from });
  });

  // client says: I joined a room
  socket.on('presence-join', ({ room, name }) => {
    if (!roomUsers.has(room)) roomUsers.set(room, new Map());
    roomUsers.get(room).set(socket.id, { name, lastPing: Date.now() });
    socket.join(room);
    broadcast(room);
  });

  // client says: I’m still here (ping every 10 s)
  socket.on('presence-ping', ({ room }) => {
    const user = roomUsers.get(room)?.get(socket.id);
    if (user) {
      user.lastPing = Date.now();
      broadcast(room);
    }
  });

  // socket disconnects
  socket.on('disconnect', () => {
    for (const [room, users] of roomUsers) {
      users.delete(socket.id);
      broadcast(room);
    }
  });

  // helper to send current list
  function broadcast(room) {
    const now = Date.now();
    const users = [...roomUsers.get(room)?.values() || []].map(u => ({
      name: u.name,
      idle: now - u.lastPing > 30_000   // idle if 30 s no ping
    }));
    io.to(room).emit('presence-list', users);
  }

  socket.on('disconnect', () => {
    console.log('[ws] disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
srv.listen(PORT, () => console.log(`API + WS on http://localhost:${PORT}`));


