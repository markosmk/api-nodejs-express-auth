const express = require('express');
const router = express.Router();
const { Category } = require('../models/category');

router.get('/', async (req, res) => {
  try {
    const categoryList = await Category.find();
    if (!categoryList) {
      res.status(500).json({ success: false });
    }
    res.json(categoryList);
  } catch (error) {
    res.send(error);
  }
});

router.get('/:id', async (req, res) => {
  // con promesas
  /*
  Category.findById(req.params.id)
    .then((category) => {
      if (!category) {
        res.status(400).json({
          success: false,
          message: 'the category with the given ID was not found.',
        });
      }
      res.status(200).json({ success: true, category });
    })
    .catch((err) => {
      res.status(400).json({ success: false, error: err });
    });
*/
  // con async await
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'the category with the given Id not found.',
      });
    }

    return res.status(200).json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

router.put('/:id', async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    },
    { new: true }
  );

  if (!category) {
    return res.status(400).json({
      success: false,
      message: 'the category with the given Id not found.',
    });
  }

  res.status(200).json({ success: true, category });
});

router.post('/', async (req, res) => {
  let category = await new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });

  category = await category.save();

  if (!category) {
    return res.status(404).send('the category cannot be created!');
  }

  res.send(category);
});

router.delete('/:id', (req, res) => {
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ success: true, message: 'category is deleted!' });
      } else {
        return res
          .status(404)
          .json({ success: false, message: 'category not found' });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

module.exports = router;
