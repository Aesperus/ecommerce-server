const express = require('express');
const router = express.Router();
const db = require('../db');

// Check if user is logged in
function loggedIn(req, res, next) {
    if(req.user) {
        return next();
    }
    return res.status(403).json({ error: 'User is not logged in.' });
}

router.post('/', loggedIn, async (req, res) => {
    const userId = req.user.id; // Id must be present if user is logged in
    const { itemId, quantity } = req.body; // Item ID and quantity are required to be present by spec

    const cartExists = await db.findCart(userId);
    if (!cartExists) {
        // If no cart exists, create one
        await db.createCart(userId, itemId, quantity);
    } else {
        // If cart exists, return an error
        return res.status(400).json({ error: 'A cart already exists for this user.' });
    }

    return res.status(200).json({ message: 'Cart created successfully' });
})

module.exports = router;