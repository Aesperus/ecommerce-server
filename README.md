# E-commerce REST API

A Node.js/Express backend for a simple e-commerce application. This project provides RESTful endpoints for user authentication, product browsing, cart management, and order processing. This is a practice project for a Codecademy course.

## Features
- User registration, login, and profile management
- Product catalog (CRUD)
- Shopping cart (add, update, remove products)
- Order creation and history
- PostgreSQL database integration
- API documentation via Swagger (OpenAPI)

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- PostgreSQL

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/Aesperus/ecommerce-server.git
   cd ecommerce-server
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up your environment variables (see `.env.example`):
   - `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGHOST`, `PGPORT`
   - Set up your session secret and, optionally, a custom port to run the server on.
4. Set up the database schema (see `resources/Database Design.png` and `resources/Database ERD.png`).

### Running the Server
```sh
npm start
```
The server will run on `http://localhost:3000` by default if no other port is provided in .env.

### API Documentation
- The API is documented using Swagger (OpenAPI). See `swagger.yaml` in the project root.
- When the server is running, you can go to `http://localhost:3000/docs` for a visual representation.

## Project Structure
```
.
├── db/                # Database connection and queries
├── routes/            # Express route handlers
├── services/          # Utility services (e.g., password hashing)
├── resources/         # Database diagrams and other resources
├── swagger.yaml       # OpenAPI documentation
├── index.js           # Main server entry point
├── package.json       # Project metadata and scripts
└── README.md          # This file
```

## Example API Endpoints
- `POST /auth/register` — Register a new user
- `POST /auth/login` — User login
- `GET /products` — List all products
- `POST /cart` — Create a cart
- `POST /cart/:cartId` — Update cart
- `POST /cart/:cartId/checkout` — Checkout and create order
- `GET /orders` — List user orders

## License
MIT
