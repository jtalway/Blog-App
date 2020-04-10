//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
require('dotenv').config();

// Create starting (default) content
const homeStartingContent = "Click COMPOSE to create a new post. Enter a title for your post and the body content, then press PUBLISH and you'll be redirected to the home page where a part of it will be displayed. Click on READ MORE to see the full post on its own page. While there, click on DELETE POST if you wish to delete the post.";
const aboutContent = "A simple blogging application using JavaScript, Node, Express, MongoDB.";
const contactContent = "Hi I'm Jason. I'm a freelance Full-Stack Web Developer.";
// Create the app using express
const app = express();
// Set the view engine using ejs
app.set('view engine', 'ejs');
// Use body-parser
app.use(bodyParser.urlencoded({extended: true}));
// Tell express our files are in the public folder
app.use(express.static("public"));
// connect to mongoDB /DBname
mongoose.connect("mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-3kne9.mongodb.net/BlogDB?retryWrites=true&w=majority", {
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
     content: post.content,
     id: requestedPostId

   });

 });
});

app.post("/delete", (req, res) => {
    // Get id of post to be deleted from request body (passed from post.ejs btn)
    const requestedId = req.body.deleteButton;
    // Search database for post and delete; redirect to home route
    Post.findByIdAndDelete({_id: requestedId}, (err) => {
        if (!err) {
            // console.log("Blog post successfully deleted!");
            res.redirect("/");
        } else {
            console.log(err);
        }
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
