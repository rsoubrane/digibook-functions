const functions = require("firebase-functions");
const firebase = require("firebase");
const admin = require("firebase-admin");
const app = require("express")();
const serviceAccount = require("./digibook-project-firebase.json");

const config = {
	apiKey: "AIzaSyDYk6Is06YLQvQIm8bwVn9KsNBeayP8yr4",
	authDomain: "digibook-project.firebaseapp.com",
	databaseURL: "https://digibook-project.firebaseio.com",
	projectId: "digibook-project",
	storageBucket: "digibook-project.appspot.com",
	messagingSenderId: "471922748473",
	appId: "1:471922748473:web:f0d24ff782227c203db1e8"
};

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://digibook-project.firebaseio.com"
});

firebase.initializeApp(config);

const db = admin.firestore();

app.get("/posts", (req, res) => {
	db.collection(`posts`)
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

	db.collection(`posts`)
		.add(newPost)
		.then(doc => {
			res.json({ message: `document ${doc.id} created successfully` });
		})
		.catch(err => {
			res.status(500).json({ error: "something went wrong" });
			console.log(err);
		});
});

const isEmail = email => {
	const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (email.match(regEx)) return true;
	else return false;
};

const isEmpty = string => {
	if (string.trim() === "") return true;
	else return false;
};

//Signup route
app.post("/signup", (req, res) => {
	const newUser = {
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		handle: req.body.handle
	};

	let errors = {};

	if (isEmpty(newUser.email)) {
		errors.email = "Must not be empty";
	} else if (!isEmail(newUser.email)) {
		errors.email = "Must be a valid email address";
	}

	if (isEmpty(newUser.password)) errors.password = "Must not be empty";
	if (newUser.password !== newUser.confirmPassword) errors.confirmPassword = "Passwords must match";
	if (isEmpty(newUser.handle)) errors.handle = "Must not be empty";

	if (Object.keys(errors).length > 0) return res.status(400).json(errors);

	let token, userId;
	db.doc(`/users/${newUser.handle}`)
		.get()
		.then(doc => {
			if (doc.exists) {
				return res.status(400).json({
					handle: `this handle is already taken`
				});
			} else {
				return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
			}
		})
		.then(data => {
			userId = data.user.uid;
			return data.user.getIdToken();
		})
		.then(idToken => {
			token = idToken;
			const userCredentials = {
				handle: newUser.handle,
				email: newUser.email,
				createdAt: new Date().toISOString(),
				userId
			};
			return db.doc(`/users/${newUser.handle}`).set(userCredentials);
		})
		.then(() => {
			return res.status(201).json({ token });
		})
		.catch(err => {
			console.error(err);
			if (err.code === "auth/email-already-in-use") {
				return res.status(400).json({ email: `Email is already in use` });
			} else {
				return res.status(500).json({ error: err.code });
			}
		});
});

exports.api = functions.region("europe-west1").https.onRequest(app);
