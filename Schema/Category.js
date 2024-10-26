const mongoose = require('mongoose');

const CategoryShema = new mongoose.Schema({
    categoryName: String,
    categoryDiscription: String,
    isDeleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('categorys', CategoryShema);