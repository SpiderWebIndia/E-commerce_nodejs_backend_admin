const mongoose = require('mongoose');

const productShema = new mongoose.Schema({
    name: { type: String, required: false },
    price: { type: String, required: false },
    category: { type: String, required: false },
    userId: { type: String, required: false },
    company: { type: String, required: false },
    image: { type: String, required: false },
    discription: { type: String, required: false },
    isDeleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('products', productShema);