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

function validation (req, res, next) {
    const { itemId, quantity } = req.body; // Validate if itemID and quantity are present in the request body
    if (!itemId || !quantity) {
        return res.status(400).json({ error: 'Item ID and quantity are required.' });
    }
    if (quantity <= 0 || !Number.isInteger(quantity)) { // Quantity must be a positive integer
        return res.status(400).json({ error: 'Quantity must be a positive integer.' });
    }
    next();
}

router.get('/:cartId', loggedIn, async (req, res) => {
    const cart = await db.findCartById(req.params.cartId);
    if (!cart) {
        return res.status(404).json({ error: 'Cart not found.' });
    }
    const products = await db.getCartProducts(req.params.cartId);
    return res.status(200).json({ cart, products });
});

router.post('/', loggedIn, validation, async (req, res) => {
    const userId = req.user.id; // Id must be present if user is logged in
    const { itemId, quantity } = req.body; // Item ID and quantity are required to be present by spec
    let cart;

    const cartExists = await db.findCart(userId);
    if (!cartExists) {
        // If no cart exists, create one
        cart = await db.createCart(userId, itemId, quantity);
    } else {
        // If cart exists, return an error
        return res.status(400).json({ error: 'A cart already exists for this user.' });
    }
    const products = await db.getCartProducts(cart.id);
    return res.status(200).json({ message: 'Cart created successfully', cart, products });
})

router.post('/:cartId', loggedIn, validation, async (req, res) => {    
    const { itemId, quantity } = req.body;

    // Check if the cart exists
    const cartExists = await db.findCartById(req.params.cartId);
    if (!cartExists) {
        return res.status(404).json({ error: 'Cart not found.' });
    }

    // Update the cart with the new item
    const updatedCart = await db.updateCart(req.params.cartId, itemId, quantity);
    const products = await db.getCartProducts(req.params.cartId);
    return res.status(200).json({ message: 'Cart updated successfully', updatedCart, products });
})

router.post('/:cartId/checkout', loggedIn, async (req, res) => {
    const { payment } = req.body;
    if (!payment || !payment.firstName || !payment.lastName || !payment.cardNumber || !payment.expiryDate || !payment.cvv) { // Validate payment details
        return res.status(400).json({ error: 'All payment details are required' });
    }

    try {
        const cart = await db.findCartById(req.params.cartId); // Find the cart by ID
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found.' });
        }

        const paymentStatus = true; // Mock payment processing
        if (!paymentStatus) {
            return res.status(500).json({ error: 'Payment processing failed.' });
        }

        const order = await db.createOrder(cart, req.user.id);  // Create the order
        if (!order) {
            return res.status(500).json({ error: 'Order creation failed.' });
        }
        const products = await db.getOrderProducts(order.id); // Get the order products
        await db.deleteCart(cart.id); // Delete the cart after successful order creation
        return res.status(200).json({ message: 'Order created successfully', order, products }); // Return the order and its products
    } catch (error) {
        console.error('Error during checkout:', error);
        return res.status(500).json({ error: 'An error occurred during checkout.' });
    }
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
        return res.status(204).json();
    } else {
        const products = await db.getCartProducts(cartId);
        return res.status(200).json({ updatedCart, products }); // If there are products left in the cart, return the updated cart and its products
    }
})

module.exports = router;