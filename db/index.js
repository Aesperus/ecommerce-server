const { Pool } = require('pg');
const DB = process.env; // Load Database configuration from environment variables
const crypt = require('../services/securePass.js'); // Import the secure password service

// Create a new pool instance with the database configuration
const pool = new Pool({
    user: DB.PGUSER,
    host: DB.PGHOST,
    database: DB.PGDATABASE,
    password: DB.PGPASSWORD,
    port: DB.PGPORT,
});

// Handle errors from the pool
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Handle termination signals
process.on('SIGINT', async () => {
    await pool.end();
    process.exit(0);
});

// Function to execute a query against the database
// Returns a promise that resolves to the result of the query
const query = (text, params) => {
    return pool.query(text, params);
}

// Function to find a user by email
// Returns a promise that resolves to the user object if found, or null if not found
const findUserEmail = async (email) => {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0]; // Return the first user found with the given email
}

// Function to find a user by ID
// Returns a promise that resolves to the user object if found, or null if not found
const findUserById = async (id) => {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
}

// Function to create a new user
// Takes user data as input, encrypts the password, and inserts the user into the database
const createUser = async (data) => {
    const { email, password, firstName, lastName } = data;

    const hashedPassword = await crypt.encryptPassword(password); // Encrypt the password

    const result = await query(
        'INSERT INTO users (email, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING *',
        [email, hashedPassword, firstName, lastName]
    );
    return result.rows[0]; // Return the newly created user
}

// Function to get all products from the database
// Returns a promise that resolves to an array of product objects
const getAllProducts = async () => {
    const result = await query('SELECT * FROM products'); // Query to get all products
    return result.rows; // Return the list of products
}

const getProductById = async (productId) => {
    const result = await query('SELECT * FROM products WHERE id = $1', [productId]);
    return result.rows[0];
}

// Function to update a user's information
// Takes user ID and data as input, updates the user's information in the database
const updateUser = async (id, data) => {
    const { email, firstName, lastName } = data;

    const result = await query(
        'UPDATE users SET email = $1, first_name = $2, last_name = $3 WHERE id = $4 RETURNING email, first_name, last_name',
        [email, firstName, lastName, id]
    );
    return result.rows[0]; // Return the updated user
}

// Find a cart by user ID
const findCart = async (userId) => {
    const result = await query('SELECT * FROM carts WHERE user_id = $1', [userId]);
    if(result.rows.length === 0) {
        return null; // Return null if no cart is found
    }

    return result.rows[0];
}

// Find a cart by its ID
const findCartById = async (cartId) => {
    const result = await query('SELECT * FROM carts WHERE id = $1', [cartId]);
    if(result.rows.length === 0) {
        return null; // Return null if no cart is found
    }

    return result.rows[0];
}

const updateCart = async (cartId, productId, quantity) => {
    // Find the added product
    const product = await getProductById(productId);
    if (!product) {
        throw new Error('Product not found');
    }
    let addedTotal = quantity * product.price; // Calculate the total price for the added product

    // Check if the product is already in the cart
    const result = await query('SELECT * FROM carts_products WHERE cart_id = $1 AND product_id = $2', [cartId, productId]);
    if(result.rows.length === 0) {
        // If the product is not in the cart, add it
        const client = await pool.connect();
        try {
            await client.query('BEGIN'); // Start a transaction
            const insertResult = await client.query(
                'INSERT INTO carts_products (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
                [cartId, productId, quantity]
            );
            // Add the new product price to the cart total
            const addTotal = await client.query(
                'UPDATE carts SET total_price = total_price + $1 WHERE id = $2 RETURNING *',
                [addedTotal, cartId]
            );
            await client.query('COMMIT'); // Commit the transaction
            client.release();
        } catch (error) {
            await client.query('ROLLBACK'); // Rollback the transaction on error
            client.release();
            throw error;            
        } finally {
            client.release();
        }
    } else {
    // Calculate the quantity change
    const quantityChange = {
        change: Math.abs(quantity - result.rows[0].quantity), // Absolute difference between the new and existing quantity
        direction: quantity < result.rows[0].quantity ? 'decrease' : 'increase' // Determine if the change is an increase or decrease
    }
        addedTotal = quantityChange.change * product.price; // Calculate the added total price based on the quantity change
        if (quantityChange.direction === 'decrease') {
            addedTotal = -addedTotal; // If decreasing, subtract the total price
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN'); // Start a transaction
            // If the product is already in the cart, update its quantity
            const updateResult = await client.query(
                'UPDATE carts_products SET quantity = $1 WHERE cart_id = $2 AND product_id = $3 RETURNING *',
                [quantity, cartId, productId]
            );        
        
            // Update the cart's total price
            const setTotal = await client.query(
                'UPDATE carts SET total_price = total_price + $1 WHERE id = $2 RETURNING *',
                [addedTotal, cartId]
            );

        await client.query('COMMIT'); // Commit the transaction
        } catch (error) {
            await client.query('ROLLBACK'); // Rollback the transaction on error
            client.release();
            throw error;
        } finally {
            client.release();
        }

    // Find and return the updated cart
    const updatedCart = await findCartById(cartId);
    return updatedCart;
    }
}

const createCart = async (userId, productId, quantity) => {
    const product = await getProductById(productId); // Find the product that the cart is initialized with
    if (!product) {
        throw new Error('Product not found');
    }

    const total = product.price * quantity; // Calculate the initial total price

    // Insert a new cart into the database
    const result = await query(
        'INSERT INTO carts (user_id, total_price) VALUES ($1, $2) RETURNING *',
        [userId, total]
    );
    if (result.rows.length === 0) {
        throw new Error('Failed to create cart');
    }

    // Insert data into the carts_products lookup table to connect the cart with the product
    const cartItem = await query(
        'INSERT INTO carts_products (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
        [result.rows[0].id, productId, quantity]
    );
    if (cartItem.rows.length === 0) {
        throw new Error('Failed to add item to cart');
    }

    return result.rows[0]; // Return the cart data
}

const findProductInCart = async (cartId, productId) => {
    const result = await query('SELECT * FROM carts_products WHERE cart_id = $1 AND product_id = $2', [cartId, productId]);
    if (result.rows.length === 0) {
        return null; // Return null if the product is not found in the cart
    }

    return result.rows[0];
}

const removeProductFromCart = async (cartId, productId) => {
    // Get the current cart details related to the product being removed
    const currentCart = await query('SELECT * FROM carts_products WHERE cart_id = $1 AND product_id = $2', [cartId, productId]);
    const removedQuantity = currentCart.rows[0].quantity; // Get the quantity of the product being removed
    const product = await getProductById(productId); // Get the product details
    const removedTotal = removedQuantity * product.price; // Calculate the total price of the removed product

    // Delete the product from the cart
    await query('DELETE FROM carts_products WHERE cart_id = $1 AND product_id = $2', [cartId, productId]);
    // Check if there are products left in the cart
    const newCart = await query('SELECT * from carts_products WHERE cart_id = $1', [cartId]);
    // If there are no products left, delete the cart and return null
    if (newCart.rows.length === 0) {
        await query('DELETE FROM carts WHERE id = $1', [cartId]);
        return null;
    } else {
        // If there are products left in the cart, update the total price, find the updated cart and return it
        await query('UPDATE carts SET total_price = round(total_price - $1, 2) WHERE id = $2', [removedTotal, cartId]);
        const updatedCart = await findCartById(cartId);
        return updatedCart;
    }
}

// Retrieve all products in the cart
const getCartProducts = async (cartId) => {
    const cart = await query(
        'SELECT products.name, carts_products.quantity FROM carts JOIN carts_products ON carts.id = carts_products.cart_id JOIN products ON carts_products.product_id = products.id WHERE carts.id = $1',
        [cartId]
    )
    return cart.rows; // Return the product details
}

module.exports = {
    query,
    findUserEmail,
    findUserById,
    createUser,
    getAllProducts,
    getProductById,
    updateUser,
    findCart,
    findCartById,
    updateCart,
    createCart,
    findProductInCart,
    removeProductFromCart,
    getCartProducts
};