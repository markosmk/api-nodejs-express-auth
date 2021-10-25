const mongoose = require('mongoose');

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

exports.Product = mongoose.model('Product', productSchema);
