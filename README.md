# PairPad – Real-Time Programming Interview Platform

**PairPad** is a full-stack, real-time pair programming and technical interview platform designed to simulate collaborative coding environments like those used in top-tier tech company interviews.

Built with the MERN stack, WebSockets, Monaco Editor, and AWS integrations, PairPad supports live code sharing, presence indicators, video tiles, screen recording, and collaborative editing — making it an ideal system for mock interviews, remote pair programming, or technical assessments.

---

## ✨ Features

- 🧑‍💻 **Real-Time Collaborative Code Editor** using Monaco (VS Code engine)
- 🟢 **Live Cursors & Presence Tracking** with socket-based synchronization
- 🧠 **Secure Auth-Ready Backend** (JWT-ready API structure)
- 📼 **Screen Recording with One-Click Upload** to AWS S3 via presigned URLs
- 🎥 **Video Tiles** for live camera feeds
- ⚡ **Dockerized Development** with clean separation of client/server
- 🎨 **Responsive UI** with Tailwind CSS and custom editor theming
- 🌐 **Room-based Sessions** with unique shareable links

---

## 🛠️ Tech Stack

| Category       | Tools & Libraries                          |
|----------------|---------------------------------------------|
| **Frontend**   | React.js, Vite, Tailwind CSS, Monaco Editor |
| **Backend**    | Node.js, Express.js, WebSocket (Socket.IO)  |
| **Database**   | MongoDB, Mongoose                           |
| **DevOps**     | Docker, AWS S3 (presigned upload)           |
| **Realtime**   | Socket.IO, RemoteCursorManager              |
