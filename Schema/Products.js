const mongoose = require('mongoose');

const productShema = new mongoose.Schema({
    name: String,
    price: String,
    category: String,
    userId: String,
    company: String,
    discription: String,
    isDeleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('products', productShema);