/*************************************************************
 * 1. Load environment variables and required libraries
 *************************************************************/
require('dotenv').config();

const express   = require('express');
const cors      = require('cors');
const mongoose  = require('mongoose');
const jwt       = require('jsonwebtoken');
const admin     = require('./lib/firebase'); // ⬅️ Firebase Admin SDK

const authRoutes = require('./routes/auth');

const app = express();
const roomRoutes = require('./routes/rooms');
app.use('/api/rooms', roomRoutes);

/*************************************************************
 * 2. Global middleware
 *************************************************************/
const corsOptions = {
  origin: [
    "http://localhost:5173", 
    "https://pair-pad-interview.vercel.app"
  ],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

/*************************************************************
 * 3. Connect to MongoDB Atlas
 *************************************************************/
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('🗄️  Mongo connected'))
  .catch((err) => console.error('Mongo connection error:', err));

/*************************************************************
 * 4. Utility: JWT-verify middleware (added in Step 5 F)
 *************************************************************/
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.sendStatus(401);

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.sendStatus(401);
  }
}

/*************************************************************
 * 5. Routes
 *************************************************************/
app.get('/api/ping', (req, res) => res.json({ pong: true }));
app.use('/api/auth', authRoutes);

app.get('/api/secure', authMiddleware, (req, res) => {
  res.json({ secret: '✅  You are authenticated', user: req.user });
});

app.get('/', (_req, res) => res.send('API is up! Try /api/ping'));

/*************************************************************
 * 6. Boot the server (HTTP + WebSocket)
 *************************************************************/
const http = require('http');
const { Server } = require('socket.io');

const srv = http.createServer(app);
const roomUsers = new Map();
const io  = new Server(srv, {
  cors: corsOptions,
});

app.set('io', io);

const runRoutes = require('./routes/run');
app.use('/api/run', runRoutes);

const presignRoutes = require('./routes/presign');
app.use('/api/presign', presignRoutes);

io.on('connection', (socket) => {
  console.log('[ws] connected', socket.id);

  socket.on('join-room', (code) => {
    socket.join(code);
    console.log(`[ws] ${socket.id} joined ${code}`); 
  });

  socket.on('code-change', ({ code, text, from }) => {
    console.log('[ws] relay to room', code, 'from', from);
    socket.to(code).emit('code-change', { text, from });
  });

  socket.on('cursor-change', ({ room, from, position }) => {
    socket.to(room).emit('cursor-update', { from, position });
  });

  socket.on('video-ready', ({ code, from }) => {
    console.log('[ws] video-ready from', from, 'room', code);
    socket.to(code).emit('video-ready', { from });
  });

  socket.on('video-signal', ({ code, signal, from }) => {
    console.log('[ws] signal from', from, 'room', code);
    socket.to(code).emit('video-signal', { signal, from });
  });

  socket.on('presence-join', ({ room, name }) => {
    if (!roomUsers.has(room)) roomUsers.set(room, new Map());
    roomUsers.get(room).set(socket.id, { name, lastPing: Date.now() });
    socket.join(room);
    broadcast(room);
  });

  socket.on('presence-ping', ({ room }) => {
    const user = roomUsers.get(room)?.get(socket.id);
    if (user) {
      user.lastPing = Date.now();
      broadcast(room);
    }
  });

  socket.on('disconnect', () => {
    for (const [room, users] of roomUsers) {
      users.delete(socket.id);
      broadcast(room);
    }
  });

  function broadcast(room) {
    const now = Date.now();
    const users = [...roomUsers.get(room)?.values() || []].map(u => ({
      name: u.name,
      idle: now - u.lastPing > 30_000
    }));
    io.to(room).emit('presence-list', users);
  }

  socket.on('disconnect', () => {
    console.log('[ws] disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
srv.listen(PORT, () => console.log(`API + WS on http://localhost:${PORT}`));
