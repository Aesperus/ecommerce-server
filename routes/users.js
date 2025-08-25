const express = require('express');
const router = express.Router();
const db = require('../db/index.js'); // Import the database module
const validate = require('../services/validate.js'); // Import the validation service

// Check if the user is logged in
function loggedIn(req, res, next) {
    if(req.user) {
        return next();
    }
    return res.status(403).json({ error: 'User is not logged in.' });
}

// Validation service for user information update
// Validates email, password, first name, and last name
function validationService (req, res, next) {
    const data = req.body; // Get user data from the request body

    // Validate required fields - all fields must be provided
    if (!data.email || !data.password || !data.firstName || !data.lastName) { 
        return res.status(400).json({ error: 'All fields are required for user information update.' });
    }

    // Validate the email format using the validation service
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

// Route for getting user information by ID
// Returns user information without password and ID
router.get('/:userId', loggedIn, async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await db.findUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        delete user.password;
        delete user.id;
        // Return user information without password and ID
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
})

// Route for updating user information
// Validates user data and updates user information in the database
router.put('/:userId', loggedIn, validationService, async (req, res) => {
    const { userId } = req.params;
    const data = req.body; // Get updated user data from the request body
    try {
        const updatedUser = await db.updateUser(userId, data);
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.status(200).json({ message: 'User updated successfully.', user: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
})

module.exports = router;