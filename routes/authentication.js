const express = require('express');
const router = express.Router();
const db = require('../db/index.js'); // Import the database module
const validate = require('../services/validate.js'); // Import the validation service

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
router.post('/login', async (req, res) => {
    res.send('User login endpoint');
});

module.exports = router;