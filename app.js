// para leer .envs
require('dotenv/config');
const express = require('express');
// configuracion express
const app = express();
const colors = require('colors');
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
const PORT = process.env.PORT || 4000;

app.use(cors());
// permitir OPTIONS HTTP
app.options('*', cors());

// middleware: para analizar las solicitudes entrantes y poder leer datos a json
app.use(express.json());
// middleware: para logear cada solicitud realizada
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler);

// routers
app.use(`${API}/users`, UserRouter);
app.use(`${API}/categories`, CategoryRouter);
app.use(`${API}/products`, ProductRouter);
app.use(`${API}/orders`, OrderRouter);
// Express Wildcard para resolver los errores 404
app.get('*', function (req, res, next) {
  const err = new Error("Page Doesn't Exist");
  err.statusCode = 404;
  next(err);
});

mongoose
  .connect(process.env.URI_CONNECT)
  .then(() => {
    console.log('Database connection is ready...'.magenta);
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(PORT, () => {
  console.log(`Server is runing in http://localhost:${PORT}`.yellow);
});
