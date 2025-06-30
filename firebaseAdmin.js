// firebaseAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// file json bạn tải từ Firebase Console (Service account keys)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
