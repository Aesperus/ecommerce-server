const express = require('express');
const PORT = process.env.PORT || 3000; // Get PORT from environment variables
const db = require('./db/index.js') // Import the database module
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport'); // Import Passport.js for authentication
const passportConfig = require ('./services/passport.js'); // Import the passport configuration
const swaggerUi = require('swagger-ui-express'); // Import Swagger UI for API documentation
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const authenticationRouter = require('./routes/authentication.js'); // Import the authentication router
const productsRouter = require('./routes/products.js'); // Import the products router
const usersRouter = require('./routes/users.js'); // Import the users router
const cartRouter = require('./routes/cart.js'); // Import the cart router
const ordersRouter = require('./routes/orders.js'); // Import the orders router

const app = express();
// Initialize Swagger from swagger.yaml and serve it at /docs
const swaggerDocument = yaml.load(fs.readFileSync(path.resolve(__dirname, './swagger.yaml'), 'utf8'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Create a session middleware with a secret
if(!process.env.SESSION_SECRET) {
    console.warn('Warning: SESSION_SECRET is not set. Sessions will not be secure');
}
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production', // Only secure in production with HTTPS
            httpOnly: true, // Prevent XSS attacks
            maxAge: 24 * 60 * 60 * 1000 // Expires after 1 day
        }
    })
);

app.use(passport.initialize()); // Initialize Passport.js
app.use(passport.session()); // Use Passport.js session

app.use('/auth', authenticationRouter); // Use the authentication router
app.use('/products', productsRouter); // Use the products router
app.use('/users', usersRouter); // Use the users router
app.use('/cart', cartRouter); // Use the cart router
app.use('/orders', ordersRouter); // Use the orders router

app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec); // Serve the Swagger JSON spec
});

app.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        if(!result) {
            return res.status(404).send('Database connection failed');
        }
        return res.send('Database connection successful');
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});