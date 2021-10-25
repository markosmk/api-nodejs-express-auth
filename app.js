const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
// para leer .envs
require('dotenv/config');

app.use(cors());
// permitir OPTIONS HTTP
app.options('*', cors());

// routers a colecciones
const UserRouter = require('./routers/user');
const CategoryRouter = require('./routers/category');
const ProductRouter = require('./routers/product');
const OrderRouter = require('./routers/order');

// middleware: para analizar las solicitudes entrantes y poder leer datos a json
app.use(express.json());
// middleware: para logear cada solicitud realizada
app.use(morgan('tiny'));

// constants
const API = process.env.API_URL;

// routers
app.use(`${API}/users`, UserRouter);
app.use(`${API}/categories`, CategoryRouter);
app.use(`${API}/products`, ProductRouter);
app.use(`${API}/orders`, OrderRouter);

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
