const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  "rbxs1c": { "longURL": "http://www.reddit.com", "userID": "ipym6n" },
  "r3r1c": { "longURL": "http://www.reddit.com", "userID": "i32t6n" }
};


describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
  it('should return undefined if the user does not exist', function() {
    const user = getUserByEmail("user500@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});

describe("urlsForUser", function() {
  it("Should return filtered object that contains all links with that userID", function() {
    const object = urlsForUser("ipym6n", urlDatabase);
    const expectedOutput = { "rbxs1c": { "longURL": "http://www.reddit.com", "userID": "ipym6n" } };
    assert.deepEqual(object, expectedOutput);
  });
});