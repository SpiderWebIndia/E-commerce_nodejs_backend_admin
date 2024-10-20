const mongoose = require('mongoose');

const UserShema = new mongoose.Schema({
    name: String,
    email: String,
    mobile: Number,
    password: String
});

module.exports = mongoose.model('users', UserShema);