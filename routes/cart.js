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

router.get('/:cartId', loggedIn, async (req, res) => {
    const cart = await db.findCartById(req.params.cartId);
    if (!cart) {
        return res.status(404).json({ error: 'Cart not found.' });
    }
    return res.status(200).json(cart);
});

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

router.post('/:cartId', loggedIn, async (req, res) => {    
    const { itemId, quantity } = req.body;

    // Check if the cart exists
    const cartExists = await db.findCartById(req.params.cartId);
    if (!cartExists) {
        return res.status(404).json({ error: 'Cart not found.' });
    }

    // Update the cart with the new item
    const updatedCart = await db.updateCart(req.params.cartId, itemId, quantity);
    return res.status(200).json(updatedCart);
})

router.delete('/:cartId/:productId', loggedIn, async (req, res) => {
    const { cartId, productId } = req.params; 

    // Check if the cart exists
    const cartExists = await db.findCartById(cartId);
    if (!cartExists) {
        return res.status(404).json({ error: 'Cart not found.' });
    }

    // Check if the product exists in the cart
    const productExists = await db.findProductInCart(cartId, productId);
    if (!productExists) {
        return res.status(404).json({ error: 'Product not found in cart.' });
    }

    // Remove the product from the cart
    const updatedCart = await db.removeProductFromCart(cartId, productId);
    if (updatedCart === null) { // If there are no more products in the cart, return 204
        return res.status(204).json({ message: 'Cart is empty and has been removed.' });
    } else {
        return res.status(200).json(updatedCart); // If there are products left in the cart, return the updated cart
    }
})

module.exports = router;