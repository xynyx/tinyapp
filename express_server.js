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

// Check to see if the email address already exists in the list of users
function checkUsersEmail(emailAddress) {
  for (const user in users) {
    // NOT users[users.email]!!!
    if (users[user].email === emailAddress) {
      return true;
    }
  }
  return false;
};

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

// urlDatabase in json format (REMOVE)
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Create new tiny URL
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  let templateVars = { 
    user
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
  const user = users[req.cookies["user_id"]];
  let templateVars = {
    user,
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars)
});

app.get("/register", (req, res) => {
  res.render("urls_register")
})

app.post("/register", (req, res) => {
  if(checkUsersEmail(req.body.email)) {
    res.sendStatus(400);
  }
  const id = generateRandomString();
  users[id] = { id, email: req.body.email, password: req.body.password };

  if (users[id].email === "" || users[id].password === "") {
    res.sendStatus(400);
  } else {
    res.cookie("user_id", users[id].id)
    res.redirect("/urls");
  }
  console.log(users);
  // console.log(users[id].id)
})

// Generate random 6-digit shortURL code and attach longURL to it
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  // TinyURL will not function correctly without proper protocol; add if missing
  if (!req.body.longURL.includes("http://")) {
    urlDatabase[shortURL] = `http://${req.body.longURL}`;
  } else {
    urlDatabase[shortURL] = req.body.longURL;
  }
  res.redirect(`/urls/${shortURL}`);
});

// Displays the index which is a list of the urlDatabase shortURL:longURL pairs
app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
    let templateVars = { 
      urls: urlDatabase,
      user
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/register");
  }
  // console.log(user)
});

// When the shortened link is clicked on, redirect to the site
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Login and create cookie for current user
// app.post("/login", (req, res) => {
//   res.cookie("username", req.body.username);
//   res.redirect("/urls");
// });

app.get("/login", (req, res) => {
  res.render("urls_login")
})

// Logout and delete cookie for current user
app.post("/logout", (req, res) => {
  res.clearCookie("user_id", users[req.cookies["user_id"]]);
  res.redirect("/urls");
})

// Listen for the server on the port; required to operate (though nothing needs to be put in the function itself)
app.listen(PORT, () => {});


