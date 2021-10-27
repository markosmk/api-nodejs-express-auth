const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  orderItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderItem',
      required: true,
    },
  ],
  shippingAddress1: {
    type: String,
    required: true,
  },
  shippingAddress2: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: 'Pending',
  },
  totalPrice: {
    type: Number,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  dateOrdered: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

orderSchema.set('toJSON', {
  virtuals: true,
});

exports.Order = mongoose.model('Order', orderSchema);

/*
Ejemplo Respuesta Pedido:
{
  orderItems: [
    {
      quantity: 2,
      product: '4fcfc406ae79b0a6a90d2585',
    },
    {
      quantity: 5,
      product: '2fd293c7d3abe7295b1403c4',
    },
  ],
  shippingAddress1: 'Francis Street , 22',
  shippingAddress2: '1-B',
  ...
};
*/
