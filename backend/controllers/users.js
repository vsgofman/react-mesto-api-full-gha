const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const ConflictError = require('../errors/conflictError');
const NotFoundError = require('../errors/notFoundError');
const RequestError = require('../errors/requestError');
const User = require('../models/user');

const getUsers = (req, res, next) => User.find({})
  .then((users) => res.status(200).send(users))
  .catch(next);

const getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user === null) {
        throw new NotFoundError('Пользователь не найден');
      }
      return res.status(200).send(user);
    }).catch((err) => {
      if (err.name === 'CastError') {
        next(new RequestError('Переданы некорректные данные при поиске пользователя'));
      } else {
        next(err);
      }
    });
};

// POST /signup
const register = (req, res, next) => {
  const {
    email, password, name, about, avatar,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email, password: hash, name, about, avatar,
    })).then((user) => res.status(201).send({
      email: user.email,
      name: user.name,
      about: user.about,
      avatar: user.avatar,
    })).catch((err) => {
      if (err.name === 'ValidationError') {
        next(new RequestError('Переданы некорректные данные при создании пользователя'));
      }
      if (err.code === 11000) {
        next(new ConflictError('Пользователь с таким email уже существует'));
      } next(err);
    });
};

// POST /signin
const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const jwt = jsonwebtoken.sign({ _id: user._id }, 'jwt', { expiresIn: '7d' });
      res.status(200).send({ token: jwt });
    }).catch(next);
};

// GET users/me
const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (user === null) {
        throw new NotFoundError('Пользователь не найден');
      }
      res.status(200).send(user);
    }).catch((err) => {
      if (err.name === 'CastError') {
        next(new RequestError('Передан некорректный id пользователя'));
      } else {
        next(err);
      }
    });
};

// PATCH users/me
const updateProfile = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      about: req.body.about,
    },
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true, // данные будут валидированы перед изменением
    },
  ).then((user) => {
    if (user === null) {
      throw new NotFoundError('Пользователь не найден');
    }
    res.status(200).send(user);
  }).catch((err) => {
    if (err.name === 'CastError') {
      next(new RequestError('Передан некорректный id пользователя'));
    }
    if (err.name === 'ValidationError') {
      next(new RequestError('Передан некорректные данные при обновлении профиля'));
    } next(err);
  });
};

// PATCH users/me/avatar
const updateAvatar = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      avatar: req.body.avatar,
    },
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true, // данные будут валидированы перед изменением
    },
  ).then((user) => {
    if (user === null) {
      throw new NotFoundError('Пользователь не найден');
    }
    res.status(200).send(user);
  }).catch((err) => {
    if (err.name === 'CastError') {
      next(new RequestError('Передан некорректный id пользователя'));
    }
    if (err.name === 'ValidationError') {
      next(new RequestError('Переданы некорректные данные при обновлении аватара'));
    } next(err);
  });
};

module.exports = {
  getUsers,
  getUserById,
  register,
  login,
  getCurrentUser,
  updateProfile,
  updateAvatar,
};
