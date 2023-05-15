const mongoose = require("mongoose");

const Product = mongoose.model(
  "Product",
  new mongoose.Schema({
    name: String,
    size: String,
    images: [{
      type: String
    }],
    colour: String,
    price: Number,
    quantity: Number,
  })
);

module.exports = Product;
