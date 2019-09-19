const functions = require("firebase-functions");
const app = require("express")();

const FBAuth = require("./utils/fbAuth");

const { getAllPosts, postOnePost } = require("./handlers/posts");
const { signup, login } = require("./handlers/users");

//Posts Route
app.get("/posts", getAllPosts);
app.post("/post", FBAuth, postOnePost);

//Users route
app.post("/signup", signup);
app.post("/login", login);

exports.api = functions.region("europe-west1").https.onRequest(app);
