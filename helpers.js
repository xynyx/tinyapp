// Find the user that corresponds with the given email
const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
  return;
};

// For random userID & shortURL values
function generateRandomString() {
  return Math.random().toString(36).slice(2).substring(0, 6);
};

// Filters urlDatabase and creates new database that only contains links for that particular user
function urlsForUser(id, database) {
  const filteredLinks = {};
  for (const person in database) {
    if (database[person].userID === id) {
      filteredLinks[person] = database[person];
    }
  }
  return filteredLinks;
};


module.exports = { getUserByEmail, generateRandomString, urlsForUser };
