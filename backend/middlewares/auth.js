const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorizedError');

module.exports.auth = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnauthorizedError('Необходима авторизация');
  }
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, 'jwt');
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Прислан некорректный токен');
    }
    throw new UnauthorizedError('Необходима авторизация');
  }
  req.user = payload;
  return next();
};
