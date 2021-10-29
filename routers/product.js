const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const { promisify } = require('util');
const router = express.Router();
const { Product } = require('../models/product');
const { Category } = require('../models/category');
const { Mongoose } = require('mongoose');
/**
 * Image Upload Config
 */
const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('INvalid Image Type');
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, file.fieldname + '-' + Date.now() + '.' + extension);
  },
});

const uploadOptions = multer({ storage: storage });
const unlinkAsync = promisify(fs.unlink);
/**
 * Routes
 */
router.get('/', async (req, res) => {
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

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send('Invalid Product Id');
  }
  try {
    // revisamos si existe la categoria
    const categoryBD = await Category.findById(req.body.category);
    if (!categoryBD) return res.status(400).send('Invalid Category');

    // revisamos si existe el producto
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(400).json({
        success: false,
        message: 'the product with the given Id cannnot be updated.',
      });
    }

    // manejamos la imagen
    const file = req.file;
    let imagePath;

    if (file) {
      // si se esta agregando una nueva imagen, actualizamos el nombre
      const fileName = file.filename;
      const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
      imagePath = basePath + fileName;
      console.log(file);

      // y eliminamos la imagen actual
      const apiUrl = `${req.protocol}://${req.get('host')}/`;
      const imageToDel = productBD.image;
      await unlinkAsync(imageToDel.split(apiUrl)[1]);
    } else {
      // si es la misma imagen, colocar el mismo nombre que tenemos guardado
      imagePath = productBD.image;
    }

    // actualizamos el producto
    if (product) {
      product.name = req.body.name;
      product.description = req.body.description;
      product.richDescription = req.body.richDescription;
      product.image = imagePath;
      product.brand = req.body.brand;
      product.price = req.body.price;
      product.category = req.body.category;
      product.stock = req.body.stock;
      product.rating = req.body.rating;
      product.numReviews = req.body.numReviews;
      product.isFeatured = req.body.isFeatured;
    }
    const productUpdated = await product.save();

    res.status(200).json({ success: true, productUpdated });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err,
    });
  }
});

router.post('/', uploadOptions.single('image'), async (req, res) => {
  try {
    const categoryBD = await Category.findById(req.body.category);
    if (!categoryBD) return res.status(400).send('Invalid Category');

    const file = req.file;
    if (!file) return res.status(400).send({ message: 'No imagen in request' });

    // recibimos el nombre de la imagen
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    let product = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: basePath + fileName,
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

router.put(
  '/gallery/:id',
  uploadOptions.array('images', 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send('Invalid Product Id');
    }
    try {
      const files = req.files;
      const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

      let imagesPaths = [];

      if (files) {
        files.map((img) => {
          imagesPaths.push(basePath + img.fileName);
        });
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
          images: imagesPaths,
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
  }
);
module.exports = router;
