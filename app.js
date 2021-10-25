const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');

// para leer .envs
require('dotenv/config');

const API = process.env.API_URL;

// middleware para analizar las solicitudes entrantes y poder leer datos a json
app.use(express.json());
// para logging cada solicitud realizada
app.use(morgan('tiny'));

const productSchema = mongoose.Schema({
  name: String,
  content: String,
  image: String,
  date: { type: Date, default: Date.now },
  hidden: Boolean,
  meta: {
    votes: Number,
    favs: Number,
  },
});

const Product = mongoose.model('Product', productSchema);

app.get(`${API}/products`, async (req, res) => {
  const productList = await Product.find();
  if (!productList) {
    res.status(500).json({ success: false });
  }

  res.send(productList);
});

app.post(`${API}/products`, (req, res) => {
  const product = new Product({
    name: req.body.name,
    content: req.body.content,
    image: req.body.image,
  });

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
    });
});

mongoose
  .connect(process.env.URI_CONNECT)
  .then(() => {
    console.log('database conecction is ready...');
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(3000, () => {
  console.log(API);
  console.log(`Server is runing in http://localhost:3000`);
});
