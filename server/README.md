# PairPad — Server

Express API & Socket.IO gateway.

### Core Tech

- **Express 5**, CORS, morgan logger
- **Socket.IO** (HTTP + WS on same port)
- **Mongoose** models (`User`, `Room`)
- **bcrypt** password hashing
- **jsonwebtoken** for JWT issue/verify
- **@aws-sdk/client-s3** for presigned URLs
- **firebase-admin** SDK for Google token verify
- **Docker** CLI invoked in `routes/run.js` for code execution
- Nodemon & dotenv in dev

### Main Routes

| Route                     | Purpose                                 |
|---------------------------|-----------------------------------------|
| `POST /api/auth/register` | Email/password signup                   |
| `POST /api/auth/login`    | Email/password login                    |
| `POST /api/auth/google`   | Firebase ID-token → JWT                 |
| `POST /api/run`           | Run submitted code in Docker            |
| `GET  /api/presign`       | S3 presigned **PUT** for recording      |
| `GET  /api/presign/list`  | Signed **GET** URLs for existing vids   |
