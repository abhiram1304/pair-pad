
---

## 📝 `server/README.md`

```markdown
# PairPad – Server

This is the backend for the PairPad collaborative coding platform. It handles user authentication, WebSocket connections for code collaboration and video signaling, REST APIs for running code, and uploading recordings to AWS S3.

---

## 🚀 Features

- REST APIs for login, registration, code execution, and pre-signed S3 uploads
- WebSocket server for real-time:
  - Code sync
  - Cursor sharing
  - Presence and heartbeats
  - Video call signaling (WebRTC)
- Containerized code execution using Docker (JS, Python, C++)
- AWS S3 recording upload support

---

## 🛠️ Setup Instructions

```bash
cd server
npm install
npm run dev
