const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const UrlRegExp = require('../utils/validateUrl');
const UnauthorizedError = require('../errors/unauthorizedError');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      validate: { validator: validator.isEmail, message: 'Введите корректный email' },
    },
    password: {
      type: String,
      select: false,
      required: true,
    },
    name: {
      type: String,
      minlength: 2,
      maxlength: 30,
      default: 'Жак-Ив Кусто',
    },
    about: {
      type: String,
      minlength: 2,
      maxlength: 30,
      default: 'Исследователь',
    },
    avatar: {
      type: String,
      validate: { validator: UrlRegExp, message: 'Введите валидную ссылку' },
      default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    },
  },
  {
    versionKey: false,
  },
);

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password') // this — это модель User
    .then((user) => {
      if (!user) {
        return Promise.reject(new UnauthorizedError('Необходима авторизация'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new UnauthorizedError('Необходима авторизация'));
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
