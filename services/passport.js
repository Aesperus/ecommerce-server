const LocalStrategy = require('passport-local').Strategy;
const db = require('../db/index.js'); // Import the database module
const crypt = require('./securePass.js'); // Import the secure password service
const passport = require('passport'); // Import Passport.js for authentication

// Configure Passport.js to use the local strategy for authentication
// The local strategy uses email and password for authentication
passport.use (new LocalStrategy({
    usernameField: 'email',  // Specify that email field should be used as username
    passwordField: 'password' // Specify that password field should be used for authentication
}, async function verify(email, password, done) {
    try {
        const user = await db.findUserEmail(email);
        if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
        }

        if (!await crypt.decryptPassword(password, user.password)) {
            return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id); // Serialize user by ID
});

passport.deserializeUser(async (id, done) => {
    const user = await db.findUserById(id);
    done(null, user); // Deserialize user by ID
});

module.exports = passport; // Export the configured passport instance