import StartPage from "./StartPage";

function Login({ onFormSubmit }) {
  return (
    <StartPage
      title="Вход"
      textButtonSubmit="Войти"
      onFormSubmit={onFormSubmit}
    />
  )
}

export default Login;