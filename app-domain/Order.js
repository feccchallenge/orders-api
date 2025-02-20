const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  status: { type: String, default: 'PENDING' },
  createdAt: { type: Date, default: Date.now },
  products: [
    {
      productId: { type: String, required: true },
      quantity: { type: Number, required: true },
    },
  ]
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;