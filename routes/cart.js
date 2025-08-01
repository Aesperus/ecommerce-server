const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.send('Get your cart items');
});

router.put('/:itemId', async (req, res) => {
    const { itemId } = req.params;
    res.send(`Update item with ID: ${itemId} in your cart`);
});

router.post('/:itemId', async (req, res) => {
    const { itemId } = req.params;
    res.send(`Add item with ID: ${itemId} to your cart`);
});

router.delete('/:itemId', async (req, res) => {
    const { itemId } = req.params;
    res.send(`Remove item with ID: ${itemId} from your cart`);
});

module.exports = router;