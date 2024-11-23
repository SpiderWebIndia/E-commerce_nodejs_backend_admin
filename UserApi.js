const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./Schema/User'); // MongoDB model for users
require('dotenv').config(); // Load environment variables

const SECRET_KEY = process.env.JWT_SECRET || 'tinkukumar.arena@gmail.com'; // Load secret key from environment variables
const router = express.Router();

router.use(express.json());

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Register a new user
router.post('/RegisterApi', async (req, resp) => {
    const { email } = req.body;
    if (!isValidEmail(email)) {
        return resp.status(400).send({ message: "Invalid email format" });
    }
    try {
        let existingData = await User.findOne({ email }).select("-password");
        if (existingData) {
            resp.status(400).send({ message: "Duplicate User. This User already exists.", data: existingData });
        } else {
            let userData = new User(req.body);
            let result = await userData.save();
            result = result.toObject();
            delete result.password;
            resp.status(201).send({
                message: "User inserted successfully",
                status: true,
                insertedData: result,
            });
        }
    } catch (error) {
        console.error("Error occurred:", error);
        resp.status(500).send("Internal Server Error");
    }
});

// User login
router.post('/LoginApi', async (req, resp) => {
    const { email, password } = req.body;
    if (!isValidEmail(email)) {
        return resp.status(400).send({ message: "Invalid email format" });
    }
    try {
        let user = await User.findOne({ email });
        if (user && user.password === password) {
            const token = jwt.sign({ userId: user._id, email: user.email }, SECRET_KEY, { expiresIn: '13h' });
            resp.status(200).send({
                message: "Login successful",
                status: true,
                token: token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    mobile: user.mobile
                }
            });
        } else {
            resp.status(401).send({ message: "Incorrect password or user not found" });
        }
    } catch (error) {
        console.error("Error occurred during login:", error);
        resp.status(500).send("Internal Server Error");
    }
});

module.exports = router;
