const express = require('express');
const router = express.Router();
const { Product } = require('../models/product');
const { Category } = require('../models/category');

router.get('/', async (req, res) => {
  const query = req.query;
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(',') };
  }
  try {
    const productList = await Product.find(filter)
      .select('name image category')
      .populate('category');

    if (!productList) {
      return res.status(500).json({ success: false });
    }
    res.send(productList);
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category');
  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});

router.put('/:id', async (req, res) => {
  try {
    const categoryBD = Category.findById(req.body.category);
    if (!categoryBD) return res.status(400).send('Invalid Category');

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        stock: req.body.stock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
      },
      { new: true }
    );

    if (!product) {
      return res.status(400).json({
        success: false,
        message: 'the product with the given Id cannnot be updated.',
      });
    }
    res.status(200).json({ success: true, product });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err,
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const categoryBD = await Category.findById(req.body.category);
    if (!categoryBD) return res.status(400).send('Invalid Category');

    let product = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      stock: req.body.stock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    });

    product = await product.save();

    if (!product) return res.status(500).send('the product cannot be created');

    res.send(product);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err,
    });
  }
  /*
  product
    .save()
    .then((createdProduct) => {
      res.status(201).json(createdProduct);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
        success: false,
      });
    });*/
});

router.delete('/:id', (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: 'product is deleted!' });
      } else {
        return res
          .status(404)
          .json({ success: false, message: 'product not found' });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get('/get/count', async (req, res) => {
  try {
    const productCount = await Product.estimatedDocumentCount();
    if (!productCount) {
      res.status(500).json({ success: false });
    }
    res.send({ count: productCount });
  } catch (err) {
    res.status(500).send({ success: false, error: err });
  }
});

router.get('/get/featured/:limit', async (req, res) => {
  const limit = req.params.limit ? req.params.limit : 0;
  try {
    const productsFeatured = await Product.find({ isFeatured: true }).limit(
      Number(limit)
    );
    if (!productsFeatured) {
      res.status(500).json({ success: false });
    }
    res.send(productsFeatured);
  } catch (err) {
    res.status(500).send({ success: false, error: err });
  }
});

module.exports = router;
