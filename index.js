const express = require('express');
const PORT = process.env.PORT; // Get PORT from environment variables
const db = require('./db/index.js') // Import the database module
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const authenticationRouter = require('./routes/authentication.js'); // Import the authentication router

const app = express();

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
// Create a session middleware with a secret
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        }
    })
);

app.use('/auth', authenticationRouter); // Use the authentication router

app.get('/', async (req, res) => {
    const result = await db.query('SELECT NOW()');
    res.send(result.rows[0]);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});