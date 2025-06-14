const admin = require('firebase-admin');

const creds = process.env.FIREBASE_CREDS
  ? JSON.parse(process.env.FIREBASE_CREDS)
  : require('../../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(creds),
});

module.exports = admin;
