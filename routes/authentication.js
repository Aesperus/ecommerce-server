const express = require('express');
const router = express.Router();

// Route for user registration
router.post('/register', async (req, res) => {
    res.send('User registration endpoint');
});

// Route for user login
router.post('/login', async (req, res) => {
    res.send('User login endpoint');
});

module.exports = router;