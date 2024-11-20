const express = require('express');
const mongodb = require('mongodb');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const authenticateToken = require('./middleware/authenticateToken');
const BrandsShema = require('./Schema/Brands'); // MongoDB model for brands
const router = express.Router();
const ObjectId = mongodb.ObjectId;

router.use(express.json());


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Set the directory for storing images
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Generate unique file name
    },
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);
        if (extname && mimeType) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed (jpeg, jpg, png).'));
        }
    },
});

// Helper function to delete file
const deleteFile = (filePath) => {
    if (filePath) {
        fs.unlink(filePath, (err) => {
            if (err) console.error("Failed to delete file:", err);
        });
    }
};

router.post('/brandAdd', authenticateToken, upload.single('image'), async (req, res) => {

    const { brandName } = req.body;

    try {
        let existingData = await BrandsShema.findOne({ brandName });
        if (existingData) {
            deleteFile(req.file?.path);
            res.status(400).send({ message: "Duplicate Brand. This Brand already exists.", data: existingData })
        } else {
            // let brandData = new BrandsShema(req.body);
            const newBrand = new BrandsShema({
                ...req.body,
                image: req.file ? req.file.path : null, // Store image path
            });
            let result = await newBrand.save();
            res.status(200).send({
                message: "Brand inserted successfully",
                status: true,
                data: result
            })
        }
    } catch (error) {
        deleteFile(req.file?.path);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/brandlist', authenticateToken, async (req, res) => {

    try {
        let brandList = await BrandsShema.find({ isDeleted: false });
        res.status(200).send({
            message: "Brand Data Fetch Successfully",
            status: true,
            data: brandList
        });
    } catch (error) {
        res.status(500).send({
            message: "Error fetching category list",
            error: error.message
        });
    }
});

router.get('/brandDeatils/:id', authenticateToken, async (req, res) => {

    const { id } = req.params;

    try {
        let brandDetails = await BrandsShema.findOne({ _id: id, isDeleted: false });
        res.status(200).send({
            message: "Brand Details Fetch Successfully",
            status: true,
            data: brandDetails,
        })
    } catch (error) {
        res.status(500).send({
            message: "Error while fetching brand details",
            error: error.message
        })
    }
});

// Brand Update ----

router.put('/brandUpdate/:id', authenticateToken, upload.single('image'), async (req, res) => {

    const { id } = req.params;

    try {

        const updateBrand = {
            ...req.body,
        };

        if (req.file) {
            updateBrand.image = req.file.path; // Update image path if new image is uploaded
        }

        const updateBrandData = await BrandsShema.findByIdAndUpdate(id, { $set: updateBrand }, { new: true });

        if (updateBrandData) {
            res.status(200).send({
                message: "Brand updated successfully",
                status: true,
                updatedData: updateBrand,
            })
        } else {
            res.status(404).send({
                message: "Category Not Found",
                status: false
            })
        }
    } catch (error) {
        res.status(500).send({
            message: "Error updating category",
            error: error.message,
        });
    }

});

// Brand Update 

router.delete('/brandDelete/:id', authenticateToken, async (req, res) => {

    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid ID format" });
    }

    try {
        const brandSoftDelete = await BrandsShema.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (brandSoftDelete) {
            res.status(200).send({
                message: "Brand soft-delete successfully",
                status: true,
                deletedData: brandSoftDelete
            })
        } else {
            res.status(404).send({
                message: "Category not found",
                status: false,
            });
        }

    } catch (error) {
        res.status(500).send({
            message: "Error deleting Category",
            error: error.message,
        });
    }

});


module.exports = router;