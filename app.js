// This is the main server file.
// Sets up the Express app, middleware (like body-parser), static file serving, view engine (EJS), and all the app routes.
// Routes will include logic for creating, displaying, editing, and deleting blog posts.


const express = require("express"); // Importing express
const expressLayouts = require("express-ejs-layouts");// Importing express-ejs-layouts // This module allows you to use EJS as a templating engine with Express
const bodyParser = require("body-parser"); // Importing body-parser
const marked = require("marked"); // Importing marked


const app = express();// Creating an instance of express
const PORT = 3000; // Setting the port to 3000

app.use(expressLayouts); // This module allows you to use EJS as a templating engine with Express
app.set("view engine", "ejs");// Setting the view engine to EJS
app.use(express.static("public")); // Serving static files from the public directory meaning that any file in the public directory can be accessed directly via the URL
app.use(bodyParser.urlencoded({ extended: true }));// Middleware to parse URL-encoded data meaning that any form data submitted will be parsed and made available in req.body

let posts = [];

app.get("/", (req, res) => {
  res.render("index", { posts });
});// The root route renders the index.ejs file and passes the posts array to it

app.get("/new", (req, res) => {
  res.render("form", { post: null });
});// The /new route renders the form.ejs file for creating a new post
// The form.ejs file will be used for both creating and editing posts

app.post("/new", (req, res) => {
  const { title, engine, content, image } = req.body; // ✅ Now accepts image input from the form

  const newPost = {
    id: Date.now().toString(),
    title,
    engine,
    content,
    image // Adds the image URL to the post object
  };

  posts.push(newPost);  //  Save the new post to memory
  res.redirect("/");    //  Redirect to homepage after saving
});

app.get("/posts/:id", (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).send("Post not found");
  }

  const htmlContent = marked.parse(post.content); // 👈 convert Markdown to HTML
  res.render("post", { post, content: htmlContent }); // 👈 pass both
});

app.get("/edit/:id", (req, res) => { // The /edit/:id route renders the form.ejs file for editing an existing post
                                     // The form.ejs file will be used for both creating and editing posts
  const post = posts.find(p => p.id === req.params.id); // Finding the post with the matching ID
  if (!post) {
    return res.status(404).send("Post not found"); // If the post is not found, send a 404 error
  }
  res.render("form", { post }); // Rendering the form.ejs file and passing the found post to it
});

app.post("/edit/:id", (req, res) => {
  const index = posts.findIndex(p => p.id === req.params.id);
  posts[index] = { ...posts[index], ...req.body };
  res.redirect("/");
});

app.post("/delete/:id", (req, res) => {
  posts = posts.filter(p => p.id !== req.params.id);
  res.redirect("/");
});

app.get("/category/:engine", (req, res) => {  // The /category/:engine route renders the index.ejs file for displaying posts of a specific engine
                                              // The engine parameter is used to filter the posts array
  const filtered = posts.filter(p => p.engine === req.params.engine);// Filtering the posts array to only include posts with the matching engine
  res.render("index", { posts: filtered });// Rendering the index.ejs file and passing the filtered posts to it
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));