const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('hello Word');
});

app.listen(3000, () => {
  console.log(`Server is runing in http://localhost:3000`);
});
