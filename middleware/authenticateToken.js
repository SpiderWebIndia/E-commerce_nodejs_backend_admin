const jwt = require('jsonwebtoken');
const SECRET_KEY = 'tinkukumar.arena@gmail.com'; // Replace with the same key used to sign the token

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Get the token from "Bearer <token>"

    if (!token) {
        return res.status(401).send({ message: "Access token missing" });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).send({ message: "Invalid or expired token" });
        }

        req.user = user; // Attach the decoded user information to the request object
        next(); // Move to the next middleware or route handler
    });
};

module.exports = authenticateToken;
