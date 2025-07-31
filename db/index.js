const { Pool } = require('pg');
const DB = process.env; // Load Database configuration from environment variables

// Create a new pool instance with the database configuration
const pool = new Pool({
    user: DB.PGUSER,
    host: DB.PGHOST,
    database: DB.PGDATABASE,
    password: DB.PGPASSWORD,
    port: DB.PGPORT,
});

// Export a query function to be used in other modules
// This function takes a SQL query and parameters, and returns the result
module.exports = {
    query: (text, params) => pool.query(text, params)
};