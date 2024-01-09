const { createToken } = require('./tokens');

function generateTokenForUser(username, isAdmin = false) {
  return createToken({ username, isAdmin });
}

module.exports = { generateTokenForUser };