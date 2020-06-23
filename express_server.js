const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "session",
    keys: ["user_id"]
  })
);
const bcrypt = require("bcrypt-nodejs");
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

const {
  getUserByEmail,
  generateRandomString,
  urlsForUser
} = require("./helpers.js");

app.listen(PORT, () => {});
app.set("view engine", "ejs");

const urlDatabase = {};
const users = {};

app.get("/", (req, res) => {
  res.redirect("/login");
})

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
app.delete("/urls/:shortURL", (req, res) => {
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
app.put("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  if (
    urlsForUser(user.id, urlDatabase)[shortURL].userID ===
    urlDatabase[shortURL].userID
  ) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
});

// After generating new shortURL, redirect user to urls_show page displaying the short and long URL
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  const userObject = urlsForUser(user.id, urlDatabase)[shortURL];
  const linkData = urlDatabase[shortURL];
  // Check filtered list whether a shortURL exists (ie. not undefined), and continue
  if (user && userObject !== undefined) {
    let templateVars = {
      linkData,
      visits: linkData.visits,
      uniqueVisits: linkData.uniqueVisits,
      user,
      shortURL: shortURL,
      longURL: userObject.longURL
    };

    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
});

// Generate random shortURL code and attach longURL to it
app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = generateRandomString();
  // TinyApp will not function correctly without proper protocol; add if missing
  if (
    !req.body.longURL.includes("http://") &&
    !req.body.longURL.includes("https://")
  ) {
    urlDatabase[shortURL] = {
      longURL: `http://${req.body.longURL}`,
      userID: user.id,
      visits: 0,
      uniqueVisits: 0,
      visitorID: [],
      timeStamp: []
    };
  } else {
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: user.id,
      visits: 0,
      uniqueVisits: 0,
      visitorID: [],
      timeStamp: []
    };
  }
  res.redirect(`/urls/${shortURL}`);
});

// Displays the index which is a list of the urlDatabase shortURL:longURL pairs
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    let templateVars = {
      urls: urlsForUser(user.id, urlDatabase),
      user
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  res.render("urls_register", { user: undefined });
});

// Register the user, checking for validity
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Email and/or password field cannot be left blank.");
    return;
  }
  if (getUserByEmail(req.body.email, users)) {
    res.status(400).send("This user already exists! Please login instead.");
    return;
  } else {
    const id = generateRandomString();
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[id] = { id, email: req.body.email, password: hashedPassword };
    req.session.user_id = users[id].id;
    res.redirect("/urls");
  }
});

// When the shortened link is clicked on, redirect to the site
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const shortURL = req.params.shortURL;
  const linkData = urlDatabase[shortURL];
  linkData.visits++;
  if (!req.session.unique) {
    req.session.unique = generateRandomString();
    linkData.uniqueVisits++;
  }
  linkData.visitorID.push(req.session.unique);
  linkData.timeStamp.push(Date());
  res.redirect(longURL);
});

// Login and create cookie for current user
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (user) {
    if (
      users[user].email === req.body.email &&
      bcrypt.compareSync(req.body.password, users[user].password)
    ) {
      req.session.user_id = users[user].id;
      res.redirect("/urls");
      // Returning here will prevent "Can't set headers after they are sent" error
      return;
    }
    res.status(403).send("The email and/or password is incorrect.");
  }
  res.status(403).send("The account does not exist. Please create an account.");
});

app.get("/login", (req, res) => {
  res.render("urls_login", { user: undefined });
});

// Logout and delete cookie for current user
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});
