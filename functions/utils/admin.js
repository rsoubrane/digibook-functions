const admin = require("firebase-admin");

const serviceAccount = require("./digibook-project-firebase.json.js");
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://digibook-project.firebaseio.com"
});

const db = admin.firestore();

module.exports = { admin, db };
