const mongoose = require('mongoose');

const BrandsShema = new mongoose.Schema({
    brandName: { type: String, required: true },
    brandDiscription: { type: String, required: false },
    image: { type: String, required: false },
    isDeleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('brands', BrandsShema);