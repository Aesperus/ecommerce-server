const express = require('express');
const PORT = process.env.PORT; // Get PORT from environment variables
const db = require('./db/index.js') // Import the database module
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');

const authenticationRouter = require('./routes/authentication.js'); // Import the authentication router
const productsRouter = require('./routes/products.js'); // Import the products router
const usersRouter = require('./routes/users.js'); // Import the users router
const cartRouter = require('./routes/cart.js'); // Import the cart router
const ordersRouter = require('./routes/orders.js'); // Import the orders router

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
            maxAge: 24 * 60 * 60 * 1000 // Expires after 1 day
        }
    })
);

app.use('/auth', authenticationRouter); // Use the authentication router
app.use('/products', productsRouter); // Use the products router
app.use('/users', usersRouter); // Use the users router
app.use('/cart', cartRouter); // Use the cart router
app.use('/orders', ordersRouter); // Use the orders router

app.get('/', async (req, res) => {
    const result = await db.query('SELECT NOW()');
    res.send(result.rows[0]);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});