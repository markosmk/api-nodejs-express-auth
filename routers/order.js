const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Order } = require('../models/order');
const { OrderItem } = require('../models/orderItem');

router.get('/', async (req, res) => {
  try {
    // obtener tbm nombre del usuario
    // y ordenar por fecha (del mas nuevo al mas antiguo)
    const orderList = await Order.find()
      .populate('user', 'name')
      .sort({ dateOrdered: -1 });
    if (!orderList) {
      res.status(500).json({ success: false });
    }
    res.json(orderList);
  } catch (err) {
    res.status(500).send({ success: false, message: err });
  }
});

router.get('/:id', async (req, res) => {
  try {
    // obtenemos los datos tambien de los productos relacionados y category
    const order = await Order.findById(req.params.id)
      .populate('user', 'name')
      .populate({
        path: 'orderItems',
        populate: { path: 'product', populate: 'category' },
      });
    if (!order) {
      res.status(500).json({ success: false });
    }
    res.json(order);
  } catch (err) {
    res.status(500).send({ success: false, message: err });
  }
});

// crear nuevo pedido
router.post('/', async (req, res) => {
  try {
    // 1- crear los articulos relacionados al pedido
    // Promise.all() combina la lista de promesas en una sola promesa
    const orderItemsIds = Promise.all(
      req.body.orderItems.map(async (item) => {
        let newOrderItem = new OrderItem({
          quantity: item.quantity,
          product: item.product,
        });

        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
      })
    );
    const orderItemsIdsResolved = await orderItemsIds;

    // 2- Calculamos el precio total del pedido (nunca traerlo del frontend), la verdad esta en la BD

    // 2-a recorremos el array para obtener el precio total de cada producto del pedido
    const totalPrices = Promise.all(
      orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate(
          'product',
          'price'
        );
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
      })
    );
    // 2/b resolvemos la promesa ex -> [345,3434]
    const totalResolved = await totalPrices;
    // 2-c sumamos los datos del array con reduce, e iniciar desde 0
    const total = totalResolved.reduce((a, b) => a + b, 0);

    // 3- finalizar creando el pedido
    let order = await new Order({
      orderItems: orderItemsIdsResolved,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: total,
      user: req.body.user,
    });

    order = await order.save();

    if (!order) {
      return res.status(404).send('the order cannot be created!');
    }

    res.send(order);
  } catch (err) {
    res.status(500).send({ success: false, message: err });
  }
});

// actualizamos estado del pedido
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      { new: true }
    );

    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'the order with the given Id not found.',
      });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).send({ success: false, message: err });
  }
});

router.delete('/:id', async (req, res) => {
  // comprobamos validez id de mongodb
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send(`Invalid Id ${req.params.id}`);
  }
  try {
    const order = await Order.findByIdAndRemove(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'order not found' });
    }

    // tambien eliminar los productos relacionados al pedido de la tabla de relacion
    await OrderItem.deleteMany({ _id: { $in: order.orderItems } });

    return res
      .status(200)
      .json({ success: true, message: 'order is deleted!' });
  } catch (err) {
    res.status(500).send({ success: false, message: err });
  }
});

router.get('/get/totalsales', async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalPrice' },
        },
      },
    ]);
    if (!totalSales) {
      return res.status(400).json({
        success: false,
        message: 'the order sales cannot be generated',
      });
    }
    res.status(200).send({ totalSales: totalSales.pop().totalSales });
  } catch (err) {
    res.status(500).send({ success: false, message: err });
  }
});

router.get('/get/count', async (req, res) => {
  try {
    const orderCount = await Order.estimatedDocumentCount();
    if (!orderCount) {
      res.status(500).json({ success: false });
    }
    res.send({ count: orderCount });
  } catch (err) {
    res.status(500).send({ success: false, error: err });
  }
});

module.exports = router;
