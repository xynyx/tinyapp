// Find the user that corresponds with the given email
const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
  return;
};


module.exports = { getUserByEmail };
