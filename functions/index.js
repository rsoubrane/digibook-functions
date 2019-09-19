const functions = require("firebase-functions");

const admin = require("firebase-admin");

var serviceAccount = require("../digibook-project-firebase.json");
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://digibook-project.firebaseio.com"
});

exports.getPosts = functions.https.onRequest((req, res) => {
	admin
		.firestore()
		.collection(`posts`)
		.get()
		.then(data => {
			let posts = [];
			data.forEach(doc => {
				posts.push(doc.data());
			});
			return res.json(posts);
		})
		.catch(err => console.log(err));
});

exports.createPost = functions.https.onRequest((req, res) => {
	if (req.method !== "POST") {
		return res.status(400).json({ error: "Method not allowed" });
	}
	const newPost = {
		body: req.body.body,
		userHandle: req.body.userHandle,
		createdAt: admin.firestore.Timestamp.fromDate(new Date())
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
