const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
var cookieParser = require('cookie-parser');
app.use(cookieParser());

function generateRandomString() {
  return Math.random().toString(36).slice(2).substring(0, 6);
};

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// urlDatabase in json format (REMOVE)
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Displays the index which is a list of the urlDatabase shortURL:longURL pairs
app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

// Create new tiny URL
app.get("/urls/new", (req, res) => {
  let templateVars = { 
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

// Delete entry added to My URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// Update longURL
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

// After generating new shortURL, and using route parameters, redirect user to urls_show page displaying the short and long URL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars)
});

// Generate random 6-digit shortURL code and attach longURL to it
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// When the shortened link is clicked on, redirect to the site
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Login and create cookie for current user
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

// Logout and delete cookie for current user
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
})

// Listen for the server on the port; required to operate (though nothing needs to be put in the function itself)
app.listen(PORT, () => {});

