const express = require('express');
const cors = require('cors');
require('./config/config'); // Ensure your database configuration is loaded
const app = express();

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

// Start the server
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
