const express = require('express');
const router = express.Router();
const db = require('../db/index.js'); // Import the database module
const validate = require('../services/validate.js'); // Import the validation service
const passport = require('passport'); // Import Passport.js for authentication
const limiter = require('express-rate-limit');

//Limit repeated requests to all authentication routes to 5 per IP per 15 minutes
router.use(limiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many requests, please try again later.',
    skipSuccessfulRequests: true // do not count successful requests
}));

// Full validation service for user registration
// Validates email, password, first name, and last name
function validationService (req, res, next) {
    const data = req.body; // Get user data from request body

    // Validate required fields - all fields must be provided
    if (!data.email || !data.password || !data.firstName || !data.lastName) { 
        return res.status(400).json({ error: 'All fields are required for user registration.' });
    }

    // Validate email format using the validation service
    // If the email format is invalid, return a 400 Bad Request status
    if (!validate.emailValidation(data.email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
    }

    // Validate password using the validation service
    // If the password does not meet the criteria, return a 400 Bad Request status
    if (!validate.passwordValidation(data.password)) {
        return res.status(400).json({ error: 'Password does not meet the required criteria.' });
    }

    // Validate first name and last name using the validation service
    // If either name contains special characters or spaces, return a 400 Bad Request status
    if (!validate.stringValidation(data.firstName) || !validate.stringValidation(data.lastName)) {
        return res.status(400).json({ error: 'First name and last name must not contain special characters (dots (.) and spaces are allowed).' });
    }
    next(); // Proceed to the next middleware or route handler
}

// Shorter validation for login
// Only checks for email and password presence and email format
function validationServiceShort (req, res, next) {
    const data = req.body;

    if(!data.email || !data.password) {
        return res.status(400).json({ error: 'Email and password are required for login.' });
    }

    if(!validate.emailValidation(data.email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
    }

    next();
}

// Route for user registration
router.post('/register', validationService, async (req, res) => {
    try {
        const data = req.body; // Get user data from request body

        // Check if a user with the given email already exists
        // If a user with the email exists, return a 409 Conflict status
        const existingUser = await db.findUserEmail(data.email);
        if (existingUser) {
            return res.status(409).json({ error: 'A user with this email already exists.' });
        }

        // Create a new user in the database
        // If user creation fails, return a 500 Internal Server Error status
        const newUser = await db.createUser(data);
        if (!newUser) {
            return res.status(500).json({ error: 'Failed to create user.' });
        }
        // Return a success response with the newly created user
        // The response includes a 201 Created status and the user data
        res.status(201).json({ message: 'User created successfully.', user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Route for user login
router.post('/login', validationServiceShort, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error.' });
        }
        if (!user) {
            return res.status(401).json({ error: info.message || 'Authentication failed.' });
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Login failed.' });
            }
            return res.status(200).json({ message: 'Login successful', user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name } });
        });
    })(req, res, next);
});

// Route for user logout
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed.' });
        }
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: 'Session destruction failed.' });
            }
            res.clearCookie('connect.sid'); // Clear session cookie
            return res.status(200).json({ message: 'Logout successful.' });
        });
    });
});

module.exports = router;