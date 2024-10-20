const express = require('express');
const mongodb = require('mongodb');
const authenticateToken = require('./middleware/authenticateToken');
const ProductAdd = require('./Schema/Products'); // MongoDB model for products
const router = express.Router();
const ObjectId = mongodb.ObjectId;

router.use(express.json());

// Add a new product
router.post('/ProductAdd', authenticateToken, async (req, resp) => {
    const { name } = req.body;
    try {
        let existingData = await ProductAdd.findOne({ name });
        if (existingData) {
            resp.status(400).send({ message: "Duplicate Product. This Product already exists.", data: existingData });
        } else {
            let ProductData = new ProductAdd(req.body);
            let result = await ProductData.save();
            resp.status(201).send({
                message: "Product inserted successfully",
                status: true,
                insertedData: result,
            });
        }
    } catch (error) {
        console.error("Error occurred:", error);
        resp.status(500).send("Internal Server Error");
    }
});

// Get the list of products
router.get('/ProductList', authenticateToken, async (req, res) => {
    try {
        let ProductListData = await ProductAdd.find({ isDeleted: false });
        res.status(200).send({
            message: "Data fetched successfully",
            data: ProductListData
        });
    } catch (error) {
        console.error("Error fetching product list:", error);
        res.status(500).send({
            message: "Error fetching product list",
            error: error.message
        });
    }
});

// Soft-delete a product
router.delete('/ProductDelete/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid ID format" });
    }
    try {
        let result = await ProductAdd.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (result) {
            res.status(200).send({
                message: "Product soft-deleted successfully",
                status: true,
                deletedData: result,
            });
        } else {
            res.status(404).send({
                message: "Product not found",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).send({
            message: "Error deleting product",
            error: error.message,
        });
    }
});

// Fetch a single product by ID
router.get('/productGetById/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const responseProduct = await ProductAdd.findOne({ _id: id, isDeleted: false });
        if (responseProduct) {
            res.status(200).send({
                message: "Product Details successfully",
                status: true,
                data: responseProduct
            });
        } else {
            res.status(404).send({
                message: "Product Not Found",
                status: false
            });
        }
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).send({
            message: "Error fetching product",
            error: error.message,
        });
    }
});

// Update a product
router.put('/ProductUpdate/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        const updatedProduct = await ProductAdd.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        if (updatedProduct) {
            res.status(200).send({
                message: "Product updated successfully",
                status: true,
                updatedData: updatedProduct,
            });
        } else {
            res.status(404).send({
                message: "Product not found",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send({
            message: "Error updating product",
            error: error.message,
        });
    }
});

module.exports = router;
