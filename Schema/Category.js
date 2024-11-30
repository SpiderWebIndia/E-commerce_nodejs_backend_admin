const mongoose = require('mongoose');

const CategoryShema = new mongoose.Schema({
    categoryName: { type: String, required: true },
    categoryDiscription: { type: String, required: true },
    image: { type: String, required: false },
    isDeleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('categorys', CategoryShema);