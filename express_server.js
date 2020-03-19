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
    // NOT users[user.email]!!!
    if (users[user].email === emailAddress) {
      return true;
    }
  }
  return false;
};

app.set("view engine", "ejs");

// "b2xVn2": "http://www.lighthouselabs.ca",
// "9sm5xK": "http://www.google.com"

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "aJ479x" },
  "9sasdK": { longURL: "http://www.godfgdfogle.com", userID: "aJ48lW" },
  "9smsdfxK": { longURL: "http://www.google.com", userID: "aJ479sdgx" },
  "9sx41K": { longURL: "http://www.google.com", userID: "aJ48lW" }
};

// urlDatabase[shortURL] = { longURL: `http://${req.body.longURL}`, userID: user.id };

function urlsForUser(id) {
  let filteredLinks = {};
  for (const person in urlDatabase) {
    if (urlDatabase[person].userID === id) {
      filteredLinks[person] = { longURL: urlDatabase[person].longURL, userID: urlDatabase[person].userID };
    }
  }
  return filteredLinks;
};

const users = {};

// urlDatabase in json format (REMOVE)
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Users json for testing
app.get("/users.json", (req, res) => {
  res.json(users);
});

// Create new tiny URL
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
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
  const user = users[req.cookies["user_id"]];
  const shortURL = req.params.shortURL;
  if (urlsForUser(user.id)[shortURL].userID === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
});

// Update longURL
app.post("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]];
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
  const user = users[req.cookies["user_id"]];
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
  if (checkUsersEmail(req.body.email)) {
    res.status(400).send('Something broke!');
  } else if (req.body.email === "" || req.body.password === "") {
    res.status(400).send('Something broke!');
  } else {
    const id = generateRandomString();
    users[id] = { id, email: req.body.email, password: req.body.password };
    res.cookie("user_id", users[id].id);
    res.redirect("/urls");
  }
});

// Generate random 6-digit shortURL code and attach longURL to it
app.post("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
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
  const user = users[req.cookies["user_id"]];
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
  if (checkUsersEmail(req.body.email)) {
    for (let id in users) {
      if (users[id].email === req.body.email && users[id].password === req.body.password) {
        res.cookie("user_id", users[id].id);
        res.redirect("/urls");
      }
    }
  }
  res.sendStatus(403);
});

app.get("/login", (req, res) => {
  res.render("urls_login", { user: undefined });
});

// app.get("/logout", (req, res) => {
//   res.render("urls_login");
// })


// Logout and delete cookie for current user
app.post("/logout", (req, res) => {
  res.clearCookie("user_id", users[req.cookies["user_id"]]);
  res.redirect("/login");
});

// Listen for the server on the port; required to operate (though nothing needs to be put in the function itself)
app.listen(PORT, () => { });


