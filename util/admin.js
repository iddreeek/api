const admin = require('firebase-admin');

var serviceAccount = require("../pos-system.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { admin, db };