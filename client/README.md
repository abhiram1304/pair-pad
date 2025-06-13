# PairPad – Client

This is the frontend of the PairPad real-time pair programming platform. Built using **React.js**, **Tailwind CSS**, and **Monaco Editor**, this interface allows users to collaborate on code, see live video tiles, run code in various languages, and record screen sessions.

---

## 🚀 Features

- Real-time collaborative code editor (Monaco + Socket.IO)
- Video tiles for face-to-face interviews
- Support for JavaScript, Python, and C++
- Code execution with containerized runners (via backend)
- Screen recording and upload to S3
- Sidebar showing online users with presence status

---

## 🛠️ Setup Instructions

```bash
cd client
npm install
npm run dev
=======
# PairPad — Client

**SPA** built with:

- React 18 + Vite
- Tailwind CSS
- Monaco Editor (VS Code engine)
- Firebase Web SDK (Google sign-in)
- Heroicons / emoji UI
- zustand (lightweight global state)
- Socket.IO client

### Key Folders

| Path                     | Description                          |
|--------------------------|--------------------------------------|
| `src/pages/`             | Home, Login, Register, Room, etc.    |
| `src/components/`        | VideoTile, Sidebar, Editor wrapper…  |
| `src/lib/`               | `socket.js`, `api.js`, `firebase.js` |
>>>>>>> 0cad048 (docs: add concise READMEs + UI polish)
