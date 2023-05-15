const mongoose = require("mongoose");

const OrderProduct = mongoose.model(
  "OrderProduct",
  new mongoose.Schema({
    orderId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Order',
      required: true
    },
    productId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Product',
      required: true
    },
    count: Number
  })
);

module.exports = OrderProduct;
