const mongoose = require("mongoose");

const Order = mongoose.model(
  "Order",
  new mongoose.Schema({
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true
    },
    orderCode: String,
    amount: {
      type: Number,
      default: 0
    },
    orderDate: {
      type: Date,
      default: new Date()
    },
    orderStatus: {
      type: String,
      enum: ['NEW', 'PENDING', 'SHIPPED'],
      default: 'NEW'
    },
  })
);

module.exports = Order;
