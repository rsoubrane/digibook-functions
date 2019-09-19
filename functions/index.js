const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");

const app = express();

var serviceAccount = require("./digibook-project-firebase.json");
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://digibook-project.firebaseio.com"
});

app.get("/posts", (req, res) => {
	admin
		.firestore()
		.collection(`posts`)
		.orderBy("createdAt", "desc")
		.get()
		.then(data => {
			let posts = [];
			data.forEach(doc => {
				posts.push({
					postId: doc.id,
					body: doc.data().body,
					userHandle: doc.data().userHandle,
					createdAt: doc.data().createdAt
				});
			});
			return res.json(posts);
		})
		.catch(err => console.log(err));
});

app.post("/post", (req, res) => {
	const newPost = {
		body: req.body.body,
		userHandle: req.body.userHandle,
		createdAt: new Date().toISOString()
	};

	admin
		.firestore()
		.collection(`posts`)
		.add(newPost)
		.then(doc => {
			res.json({ message: `document ${doc.id} created successfully` });
		})
		.catch(err => {
			res.status(500).json({ error: "something went wrong" });
			console.log(err);
		});
});

exports.api = functions.region("europe-west1").https.onRequest(app);
