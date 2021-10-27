const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
  },
  // relacion con coleccion/tabla productos
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
});

exports.OrderItem = mongoose.model('OrderItem', orderItemSchema);
