// helpers/adminToken.js
const { createToken } = require('./tokens'); // Importing createToken from tokens.js

// Function to create an admin token
function getAdminToken() {
    const adminUser = {
        username: 'admin',
        isAdmin: true
    };
    return createToken(adminUser); // Using createToken to generate token
}

module.exports = { getAdminToken };
