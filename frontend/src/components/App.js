import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import PopupWithForm from './PopupWithForm';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import ImagePopup from './ImagePopup';
import InfoToolTip from './InfoTooltip';
import api from '../utils/Api';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import ProtectedRoute from './ProtectedRoute';
import * as auth from '../utils/auth.js';

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [modalResponse, setModalResponse] = useState({ open: false, status: false });
  const [selectedCard, setSelectedCard] = useState({ name: '', link: '' });
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  const tokenCheck = useCallback(() => {
    const jwt = localStorage.getItem('jwt')
    api.setHeaderToken(jwt)
    if (jwt !== null) auth.getContent(jwt)
      .then((res) => {
        setUserEmail(res.email)
        setCurrentUser(res)
        setLoggedIn(true)
        navigate('/')
      }).catch((err) => console.log(`Некорректный токен. ${err}`))
  }, [navigate])

  useEffect(() => {
    tokenCheck()
  }, [])

  useEffect(() => {
    if (loggedIn === true) {
      Promise.all([
        api.getInitialCards()
      ]).then(([cardsData]) => {
        setCards(cardsData);
      }).catch((err) => console.log(`Данные не загрузились. ${err}`))
    }
  }, [loggedIn])

  function handleEditProfileClick() { setIsEditProfilePopupOpen(true); }
  function handleEditAvatarClick() { setIsEditAvatarPopupOpen(true); }
  function handleAddPlaceClick() { setIsAddPlacePopupOpen(true); }
  function handleCardClick(card) { setSelectedCard(card); }

  function handleCardLike(card) {
    const isLiked = card.likes.some(i => i === currentUser._id);
    api.changeLikeCardStatus(card._id, !isLiked)
      .then((newCard) => {
        setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
      }).catch((err) => console.log(`С лайками какая-то проблема. ${err}`))
  }

  function handleCardDelete(card) {
    api.deleteCard(card._id).then(() => {
      setCards((state) => state.filter((c) => c._id !== card._id));
    }).catch((err) => console.log(`Карточка не удалилась. ${err}`))
  }

  function handleUpdateUser({ name, about }) {
    api.editProfile(name, about)
      .then((res) => {
        setCurrentUser(res);
        closeAllPopups();
      }).catch(err => console.log(`Данные профиля не были обновлены. ${err}`))
  }

  function handleUpdateAvatar({ avatar }) {
    api.editAvatar(avatar).then((res) => {
      setCurrentUser(res);
      closeAllPopups();
    }).catch(err => console.log(`Не удалось обновить аватар. ${err}`))
  }

  function handleAddPlaceSubmit({ name, link }) {
    api.addCard(name, link).then((newCard) => {
      setCards([newCard, ...cards]);
      closeAllPopups();
    }).catch(err => console.log(`Карточка не добавилась. ${err}`))
  }

  function closeAllPopups() {
    setIsEditProfilePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setSelectedCard({ name: '', link: '' });
    setModalResponse({ open: false, status: modalResponse.status });
  }

  function handleRegister({ email, password }) {
    auth.register(email, password)
      .then((res) => {
        setModalResponse({ open: true, status: true });
        navigate("/sign-in");
      }).catch(() => setModalResponse({ open: true, status: false }))
  }

  function handleLogin({ email, password }) {
    return auth.login(email, password)
      .then(res => {
        localStorage.setItem("jwt", res.token)
      }).then(() => {
        tokenCheck()
        setLoggedIn(true)
      }).catch(err => console.log(`Не удаётся войти. ${err}`))
  }
  
  function signOut() {
    localStorage.removeItem("jwt")
    setLoggedIn(false)
    setUserEmail('')
    api.setHeaderToken(null)
    navigate("/sign-in")
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="App">
        <div className="page">
          <div className="page__container">
            <Header
              loggedIn={loggedIn}
              signOut={signOut}
              userEmail={userEmail}
            />
            <Routes>
              <Route path="/sign-up"
                element={<Register
                  onFormSubmit={handleRegister} />}
              />
              <Route path="/sign-in"
                element={<Login
                  onFormSubmit={handleLogin} />}
              />
              <Route path="/"
                element={<ProtectedRoute
                  element={Main}
                  loggedIn={loggedIn}
                  onEditProfile={handleEditProfileClick}
                  onAddPlace={handleAddPlaceClick}
                  onEditAvatar={handleEditAvatarClick}
                  onCardClick={handleCardClick}
                  onCardLike={handleCardLike}
                  onCardDelete={handleCardDelete}
                  cards={cards}
                />}
              />
              <Route path="*"
                element={loggedIn ? <Navigate to="/" /> : <Navigate to="sign-in" />}
              />
            </Routes>
            {loggedIn && <Footer />}
          </div>
          <InfoToolTip
            modalResponse={modalResponse}
            onClose={closeAllPopups}
          />
          <EditProfilePopup
            isOpen={isEditProfilePopupOpen}
            onClose={closeAllPopups}
            onUpdateUser={handleUpdateUser}
          />
          <AddPlacePopup
            isOpen={isAddPlacePopupOpen}
            onClose={closeAllPopups}
            onAddPlace={handleAddPlaceSubmit}
          />
          <EditAvatarPopup
            isOpen={isEditAvatarPopupOpen}
            onClose={closeAllPopups}
            onUpdateAvatar={handleUpdateAvatar}
          />
          {/* Confirm delete */}
          <PopupWithForm
            title="Вы уверены?"
            name="confirm"
            textButton="Да"
          />
          <ImagePopup card={selectedCard} onClose={closeAllPopups} />
        </div>
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;