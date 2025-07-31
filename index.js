const express = require('express');
const PORT = process.env.PORT; // Get PORT from environment variables
const db = require('./db/index.js') // Import the database module

const app = express();

app.get('/', async (req, res) => {
    const result = await db.query('SELECT * FROM users');
    res.send(result.rows[0]);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});