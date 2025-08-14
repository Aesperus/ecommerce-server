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

module.exports = {
    query,
    findUserEmail,
    findUserById,
    createUser,
    getAllProducts,
    updateUser
};