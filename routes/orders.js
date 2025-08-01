const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.send(`Get all orders`);
})

router.get('/:orderId', async (req, res) => {
    const { orderId } = req.params;
    res.send(`Get order with ID: ${orderId}`);
})

module.exports = router;