//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

// Create starting (default) content
const homeStartingContent = "This is the ramblings of an insane madman... clearly. Dive in if you dare!";
const aboutContent = "I am Jason Alway, a web developer, computer programmer, and ethical hacker.";
const contactContent = "Feel free to contact me via email at jtalway@gmail.com";
// Create the app using express
const app = express();
// Set the view engine using ejs
app.set('view engine', 'ejs');
// Use body-parser
app.use(bodyParser.urlencoded({extended: true}));
// Tell express our files are in the public folder
app.use(express.static("public"));
// connect to mongoDB /DBname
mongoose.connect("mongodb://localhost:27017/blogDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// define the Schema (data layout)
const postSchema = {
  date: Date,
  title: {
    type: String,
    required: [true, 'Please enter a title.']
  },
  content: {
    type: String,
    required: [true, 'Please enter your blog post.']
  }
};

// create mongoose model based on the Schema
const Post = mongoose.model("Post", postSchema);

//
// GET
//
// HOME
app.get("/", function(req, res){
  Post.find({}).collation({locale: "en"}).sort({date: -1}).exec(function(err, posts){
  res.render("home", {
    startingContent: homeStartingContent,
    posts: posts
    });
  });
});

// ABOUT
app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

// CONTACT
app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

// COMPOSE
app.get("/compose", function(req, res){
  res.render("compose");
});

//
// POST
//
app.post("/compose", function(req, res){
  const post = new Post({
    date: Date.now(),
    title: req.body.postTitle,
    content: req.body.postBody
  });
  post.save(function(err){
    if (!err){
      res.redirect("/");
    }
});
});

// POST - ROUTING PARAMETERS
app.get("/posts/:postId", function(req, res){
  const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post){

   res.render("post", {

     title: post.title,
     date: post.date,
     content: post.content

   });

 });
});


// LISTEN
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("[+] Server started Successfully");
});
