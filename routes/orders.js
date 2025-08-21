const express = require('express');
const router = express.Router();
const db = require('../db/index');

// Middleware to check if user is logged in
function loggedIn (req, res, next) {
    if (req.user) {
        next();
    } else {
        res.status(401).send('User is not logged in.');
    }
}

router.get('/', loggedIn, async (req, res) => {
    try {
        const orders = await db.getOrders(req.user.id); // Get orders for the logged-in user
        res.status(200).json(orders); // Return all orders or an empty array
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send('Internal server error');
    }
});

router.get('/:orderId', loggedIn, async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await db.getOrderById(req.user.id, orderId); // Find order by order ID and user ID
        if (!order) {
            return res.status(404).send('Order not found.');
        }
        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;