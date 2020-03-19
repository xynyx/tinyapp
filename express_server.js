const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
var cookieSession = require('cookie-session');
app.use(cookieSession({
  name: "session",
  keys: ["user_id"]
}));
const bcrypt = require("bcrypt");

function generateRandomString() {
  return Math.random().toString(36).slice(2).substring(0, 6);
};

app.set("view engine", "ejs");

const urlDatabase = {};
const users = { "gb4177": { "id": "gb4177", "email": "matt.taylr22@gmail.com", "password": "$2b$10$N9obFc1TFjLA8uvMgr9QrelnrRgFf9YvRr6JzZzI41YvKIMGIGcgC" }, "gb1227": { "id": "gb1227", "email": "matt.tadsfsylr22@gmail.com", "password": "$2b$10$N9obFc1TFjLA8uvMgr9QrelnrRgFf9YvRr6JzZzI41YvKIMGIGcgC" } };

// Filters urlDatabase and creates new database that only contains links for that particular user
function urlsForUser(id) {
  const filteredLinks = {};
  for (const person in urlDatabase) {
    if (urlDatabase[person].userID === id) {
      filteredLinks[person] = urlDatabase[person];
    }
  }
  return filteredLinks;
};

// Find the user that corresponds with the given email
const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
  return;
};

// urlDatabase in json format (REMOVE)
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Users json for testing (REMOVE)
app.get("/users.json", (req, res) => {
  res.json(users);
});

// Create new tiny URL
app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    let templateVars = {
      user
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }

});

// Delete entry added to My URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  if (user.id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// Update longURL
app.post("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  if (urlsForUser(user.id)[shortURL].userID === urlDatabase[shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }

});

// After generating new shortURL, and using route parameters, redirect user to urls_show page displaying the short and long URL
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  // Check filtered list whether a shortURL exists (ie. not undefined), and continue
  if (user && urlsForUser(user.id)[shortURL] !== undefined) {
    let templateVars = {
      user,
      shortURL: shortURL,
      longURL: urlsForUser(user.id)[shortURL].longURL,
    };
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }

});

app.get("/register", (req, res) => {
  res.render("urls_register", { user: undefined });
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send('Email and/or password field cannot be left blank.');
    return;
  }
  if (getUserByEmail(req.body.email, users)) {
    res.status(400).send('This user already exists! Please login instead.');
    return;
  } else {
    const id = generateRandomString();
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[id] = { id, email: req.body.email, password: hashedPassword };
    req.session.user_id = users[id].id;
    // res.cookie("user_id", users[id].id);
    res.redirect("/urls");
  }
});

// Generate random 6-digit shortURL code and attach longURL to it
app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = generateRandomString();
  // TinyApp will not function correctly without proper protocol; add if missing
  if (!req.body.longURL.includes("http://")) {
    urlDatabase[shortURL] = { longURL: `http://${req.body.longURL}`, userID: user.id };
  } else {
    urlDatabase[shortURL] = { "longURL": req.body.longURL, "userID": user.id };
  }
  res.redirect(`/urls/${shortURL}`);
});

// Displays the index which is a list of the urlDatabase shortURL:longURL pairs
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    let templateVars = {
      urls: urlsForUser(user.id),
      user
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/register");
  }
});

// When the shortened link is clicked on, redirect to the site`http://${req.body.longURL}`
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Login and create cookie for current user
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (user) {
    if (users[user].email === req.body.email && bcrypt.compareSync(req.body.password, users[user].password)) {
      req.session.user_id = users[user].id;
      res.redirect("/urls");
      // Returning here will prevent "Can't set headers after they are sent" error
      return;
    }
  }
  res.status(403).send('The email and/or password is incorrect.');
});

app.get("/login", (req, res) => {
  res.render("urls_login", { user: undefined });
});

// Logout and delete cookie for current user
app.post("/logout", (req, res) => {
  res.clearCookie("user_id", users[req.session.user_id]);
  res.redirect("/login");
});

// Listen for the server on the port; required to operate (though nothing needs to be put in the function itself)
app.listen(PORT, () => { });


