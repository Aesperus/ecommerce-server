const express = require('express');
const router = express.Router();

// Route for getting all products
router.get('/', async (req, res) => {
    res.send('Get all products');
});

// Route for getting a single product by ID
router.get('/:productId', async (req, res) => {
    const { productId } = req.params;
    res.send(`Get product with ID: ${productId}`);
});

module.exports = router;