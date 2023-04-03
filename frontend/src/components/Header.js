import { useLocation, NavLink } from 'react-router-dom';
import headerLogo from '../images/header-logo.svg';

function Header({ loggedIn, signOut, userEmail }) {
  let location = useLocation();

  const navButton = location.pathname === "/sign-in"
    ? <NavLink className="header__button" to="/sign-up">Регистрация</NavLink>
    : <NavLink className="header__button" to="/sign-in">Войти</NavLink>;

  return (
    <header className="header">
      <img className="header__logo" src={headerLogo} alt="логотип" />
      <div className="header__block">
        {loggedIn && <p className="header__email">{userEmail}</p>}
        {loggedIn ? <button className="header__button header__button_logout" onClick={signOut}>Выйти</button> : navButton}
      </div>
    </header>
  )
}

export default Header;