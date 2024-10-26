const express = require('express');
const mongodb = require('mongodb');
const authenticateToken = require('./middleware/authenticateToken');
const CategorySchema = require('./Schema/Category'); // MongoDB model for products
const router = express.Router();
const ObjectId = mongodb.ObjectId;

router.use(express.json());

// Category Add
router.post('/CategoryAdd', authenticateToken, async (req, resp) => {

    const { categoryName } = req.body;
    try {
        let existingData = await CategorySchema.findOne({ categoryName });
        if (existingData) {
            resp.status(400).send({ message: "Duplicate Category. This Category already exists.", data: existingData })
        } else {
            let categoryData = new CategorySchema(req.body);
            let result = await categoryData.save();
            resp.status(201).send({
                message: "Category inserted successfully",
                status: true,
                insertedData: result,
            })
        }
    } catch (error) {
        // console.error("Error occurred:", error);
        resp.status(500).send("Internal Server Error");
    }
});

// Category List
router.get('/categoryList', authenticateToken, async (req, resp) => {

    try {
        let categoryProductListData = await CategorySchema.find({ isDeleted: false });
        resp.status(200).send({
            message: "Category Data Fetch Successfully",
            data: categoryProductListData
        });
    } catch (error) {
        // console.error("Error fetching category list:", error);
        resp.status(500).send({
            message: "Error fetching category list",
            error: error.message
        });
    }

});

// Product Details 

router.get('/categoryGetById/:id', authenticateToken, async (req, resp) => {

    const { id } = req.params;
    try {
        const responseCategory = await CategorySchema.findOne({ _id: id, isDeleted: false });

        if (responseCategory) {
            resp.status(200).send({
                message: "Category Details Successfully",
                status: true,
                data: responseCategory,
            })
        } else {
            resp.status(404).send({
                message: "Category Not Found",
                status: false
            });
        }
    } catch (error) {
        // console.error("Error fetching Category:", error);
        resp.status(500).send({
            message: "Error fetching Category",
            error: error.message,
        });
    }

})

// Soft Delete by delete

router.delete('/CategoryDelete/:id', authenticateToken, async (req, res) => {

    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid ID format" });
    }

    try {

        const categorySoftDelte = await CategorySchema.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (categorySoftDelte) {
            res.status(200).send({
                message: "Category soft-deleted successfully",
                status: true,
                deletedData: categorySoftDelte,
            })
        } else {
            res.status(404).send({
                message: "Category not found",
                status: false,
            });
        }

    } catch (error) {
        // console.error("Error deleting Category:", error);
        res.status(500).send({
            message: "Error deleting Category",
            error: error.message,
        });
    }

});

// Update by Category

router.put('/CategoryUpdate/:id', authenticateToken, async (req, resp) => {

    const { id } = req.params;
    const updateDataCtgry = req.body;
    try {
        const updateCategory = await CategorySchema.findByIdAndUpdate(id, { $set: updateDataCtgry }, { new: true });
        if (updateCategory) {
            resp.status(200).send({
                message: "Category updated successfully",
                status: true,
                updatedData: updateCategory,
            })
        } else {
            resp.status(404).send({
                message: "Category Not Found",
                status: false
            })
        }
    } catch (error) {
        // console.error("Error updating category:", error);
        resp.status(500).send({
            message: "Error updating category",
            error: error.message,
        });
    }
})

module.exports = router;