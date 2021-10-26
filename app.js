// para leer .envs
require('dotenv/config');

const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/errorHandler');
// routers a colecciones
const UserRouter = require('./routers/user');
const CategoryRouter = require('./routers/category');
const ProductRouter = require('./routers/product');
const OrderRouter = require('./routers/order');

// constants
const API = process.env.API_URL;

app.use(cors());
// permitir OPTIONS HTTP
app.options('*', cors());

// middleware: para analizar las solicitudes entrantes y poder leer datos a json
app.use(express.json());
// middleware: para logear cada solicitud realizada
app.use(morgan('tiny'));
app.use(authJwt());
app.use(errorHandler);

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
  console.log(`Server is runing in http://localhost:3000`);
});
