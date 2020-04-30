const admin = require("firebase-admin");
const serviceAccount = require("../secrets/serviceAccount.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://safeventinglatest.firebaseio.com"
  });

const db = admin.firestore()
exports.db = db;