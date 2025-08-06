const express = require('express');
const router = express.Router();
const db = require('../db/index.js'); // Import the database module

// Route for getting all products
router.get('/', async (req, res) => {
    try {
        const products = await db.getAllProducts();
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Route for getting a single product by ID
router.get('/:productId', async (req, res) => {
    const productId = req.params.productId;
    try {
        const result = await db.query('SELECT * FROM products WHERE id = $1', [productId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;