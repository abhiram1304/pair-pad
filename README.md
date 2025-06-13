# PairPad – Real-Time Programming Interview Platform

**PairPad** is a full-stack, real-time pair-programming and technical-interview platform that recreates the collaborative coding experience used by leading tech companies.

Built with the **MERN** stack, WebSockets, Monaco Editor and AWS/Firebase integrations, PairPad provides live code sharing, video chat, screen recording, containerised code-execution and OAuth – ideal for mock interviews, remote pair-programming or coding assessments.

---

## ✨ Feature Highlights

| Category | Details |
|----------|---------|
| **Live Editor** | Monaco (VS Code engine) with syntax highlighting & 70+ language grammars |
| **Real-Time** | Remote-cursor colours, presence list, room codes, instant text sync via **Socket.IO** |
| **Multi-Language Runner** | Docker-isolated execution of **JavaScript (Node 20)**, **Python 3.11** & **C++17 (GCC 12)**, streaming stdout/stderr back to the client |
| **Video Tiles** | Self / remote camera feeds with simple-peer (WebRTC) & self-mute toggle |
| **Screen Recording** | One-click start/stop → auto-upload to **AWS S3** with presigned PUT, plus recordings gallery |
| **Auth** | • Email + password (bcrypt + JWT) <br>• **Google Sign-In** (Firebase Web SDK → Firebase Admin verify → JWT) |
| **UI / UX** | Tailwind CSS, dark theme, responsive layout, emoji tooltips |
| **Security** | JWT-protected API routes, Docker soft-limits (CPU + memory), content-type-restricted S3 uploads |
| **Dev DX** | Vite HMR, nodemon, concurrently, ESLint/Prettier, dotenv |
| **Deploy-ready** | Clean separation of `/client` & `/server` for container or cloud deployment |

---

## 🛠️ Tech Stack

| Layer | Stack / Libraries |
|-------|-------------------|
| **Frontend** | React 18 • Vite • Tailwind CSS • **Monaco Editor** • zustand |
| **Realtime / Media** | Socket.IO • RemoteCursorManager • simple-peer (WebRTC) |
| **Backend** | Node.js 20 • Express 5 • JWT • bcrypt • dotenv |
| **Code Runner** | Docker CLI (Node 20-alpine, Python 3.11-alpine, GCC 12-bullseye) |
| **Database** | MongoDB Atlas • Mongoose |
| **Auth Providers** | Email/Password • **Firebase Google OAuth** (firebase-admin, firebase/app, firebase/auth) |
| **Object Storage** | **AWS S3** – `@aws-sdk/client-s3` + presigned URLs |
| **Dev Tooling** | Docker, nodemon, concurrently, ESLint/Prettier |

---
