const admin = require('firebase-admin');

var serviceAccount = require("../pos-system.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'online-shop-ej1117.appspot.com'
});

const db = admin.firestore();
const bucket = admin.storage().bucket()

module.exports = { admin, db, bucket };