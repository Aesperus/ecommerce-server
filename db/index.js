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

module.exports = {
    query,
    findUserEmail,
    findUserById,
    createUser
};