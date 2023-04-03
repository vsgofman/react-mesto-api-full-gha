const ForbiddenError = require('../errors/forbiddenError');
const NotFoundError = require('../errors/notFoundError');
const RequestError = require('../errors/requestError');
const Card = require('../models/card');

const getCards = (req, res, next) => Card.find({})
  .then((cards) => res.status(200).send(cards))
  .catch(next);

// POST /cards
const createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new RequestError('Переданы некорректные данные при создании карточки.'));
      } else {
        next(err);
      }
    });
};

// DELETE /cards/:cardId
const deleteCardById = (req, res, next) => {
  Card.findOne({ _id: req.params.cardId })
    .then((card) => {
      if (card === null) {
        throw new NotFoundError('Карточка с указанным id не найдена');
      }
      if (card.owner.valueOf() !== req.user._id) {
        throw new ForbiddenError('Вы можете удалить только свою карточку');
      }
      return Card.findByIdAndRemove(req.params.cardId)
        .then(() => res.status(200).send({ message: 'Карточка удалена.' }))
        .catch(next);
    }).catch((err) => {
      if (err.name === 'CastError') {
        next(new RequestError('Переданы некорректные данные для удаления карточки'));
      } else {
        next(err);
      }
    });
};

// PUT /cards/:cardId/likes
const addLike = (req, res, next) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
  { new: true },
).then((card) => {
  if (card === null) {
    throw new NotFoundError('Карточка с указанным id не найдена');
  }
  return res.status(200).send(card);
}).catch((err) => {
  if (err.name === 'CastError') {
    next(new RequestError('Переданы некорректные данные для постановки/снятии лайка'));
  } else {
    next(err);
  }
});

// DELETE /cards/:cardId/likes
const deleteLike = (req, res, next) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } }, // убрать _id из массива
  { new: true },
).then((card) => {
  if (card === null) {
    throw new NotFoundError('Карточка с указанным id не найдена');
  }
  return res.status(200).send(card);
}).catch((err) => {
  if (err.name === 'CastError') {
    next(new RequestError('Переданы некорректные данные для постановки/снятии лайка'));
  } else {
    next(err);
  }
});

module.exports = {
  getCards,
  createCard,
  deleteCardById,
  addLike,
  deleteLike,
};
