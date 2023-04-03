import { useState } from 'react';
import './styles/StartPage.css';

function StartPage({ title, textButtonSubmit, onFormSubmit, children }) {
  const [userData, setUserData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setUserData({
      ...userData,
      [name]: value
    })
  }

  const handleSubmit = (evt) => {
    evt.preventDefault();
    if (!userData.email || !userData.password) return
    onFormSubmit(userData)
  }

  return (
      <div className="start-page">
        <h2 className="start-page__title">{title}</h2>
        <form className="form start-page__form" onSubmit={handleSubmit}>
          <input
            id="email-input"
            className="start-page__input"
            onChange={handleChange}
            value={userData.email || ''}
            type="email" name="email" placeholder="Email" required
          />
          <input
            id="password-input"
            className="start-page__input"
            onChange={handleChange}
            value={userData.password || ''}
            type="password" name="password" placeholder="Пароль" minLength="6" required
          />
          <button
            className="start-page__button"
            type="submit" aria-label={textButtonSubmit}>{textButtonSubmit}</button>
        </form>
        {children}
      </div>
  )
}

export default StartPage;