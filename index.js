const express = require('express');
const cors = require('cors');
require('./config/config'); // Ensure your database configuration is loaded
const app = express();

require('dotenv').config(); // Load environment variables from .env
// Import the routers from ProductApi and UserApi
const productRoutes = require('./ProductApi');
const userRoutes = require('./UserApi');
const categoryRoutes = require('./CategoryApi');
const brandRoutes = require('./BrandApi');

// Middleware setup
app.use(express.json());
app.use(cors());

// Register the routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categorys', categoryRoutes);
app.use('/api/brand', brandRoutes);

// Default route for server health check
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is up and running!' });
});

// Error handling middleware (optional)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 8000; // Use PORT from environment for flexibility
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
