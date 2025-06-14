const admin = require('firebase-admin');

let creds;

if (process.env.FIREBASE_CREDS_B64) {
  creds = JSON.parse(Buffer.from(process.env.FIREBASE_CREDS_B64, 'base64').toString());
} else {
  try {
    creds = require('../../serviceAccountKey.json');
  } catch {
    throw new Error(
      'Firebase credentials not found. Set FIREBASE_CREDS_B64 in the environment.'
    );
  }
}

admin.initializeApp({ credential: admin.credential.cert(creds) });

module.exports = admin;
