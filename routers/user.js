const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');

router.get('/', async (req, res) => {
  const userList = await User.find().select('-password');
  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.json(userList);
});

router.get('/:id', async (req, res) => {
  // con async await
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'the user with the given Id not found.',
      });
    }
    return res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

router.post('/', async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });

  user = await user.save();

  if (!user) {
    return res.status(404).send('the user cannot be created!');
  }

  res.send(user);
});

router.put('/:id', async (req, res) => {
  // con async await
  try {
    // check user exists
    const userExists = await User.findById(req.params.id);
    if (!userExists) {
      return res.status(400).json({
        success: false,
        message: 'the user with the given Id not found.',
      });
    }
    // comprobamos si cambia la contraseña actual
    let newPassword;
    if (req.body.password) {
      newPassword = bcrypt.hashSync(req.body.password, 10);
    } else {
      newPassword = userExists.password;
    }

    // actualizamos datos usuario
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        password: newPassword,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
      },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'the user with the given Id cannnot be updated.',
      });
    }

    return res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

router.post('/login', async (req, res) => {
  const secret = process.env.SECRET_JWT;
  try {
    // revisamos si existe
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send('The user not found');
    }
    // comparamos la contraseña
    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      const token = jwt.sign(
        {
          userID: user.id,
          isAdmin: user.isAdmin,
        },
        secret,
        { expiresIn: '1d' }
      );

      return res.status(200).send({
        user: user.email,
        token,
      });
    } else {
      res.status(400).send('password is wrong');
    }
  } catch (err) {
    res.status(500).send({ error: err });
  }
});

router.post('/register', async (req, res) => {
  try {
    // revisamos si existe
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.status(400).send('The user already exists');
    }
    let user = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    });

    // creamos usuario
    user = await user.save();

    if (!user) {
      return res.status(404).send('the user cannot be created!');
    }

    res.send(user);
  } catch (err) {
    res.status(500).send({ error: err });
  }
});

router.get('/get/count', async (req, res) => {
  try {
    const customerCount = await User.estimatedDocumentCount();
    if (!customerCount) {
      res.status(500).json({ success: false });
    }
    res.send({ count: customerCount });
  } catch (err) {
    res.status(500).send({ success: false, error: err });
  }
});

router.delete('/:id', (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: 'user is deleted!' });
      } else {
        return res
          .status(404)
          .json({ success: false, message: 'user not found' });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

module.exports = router;
