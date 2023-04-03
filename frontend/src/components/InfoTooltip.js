import './styles/InfoToolTip.css';
import modalOkImg from '../images/modal__ok.png';
import modalErrorImg from '../images/modal__error.png';

function InfoToolTip({ modalResponse, onClose }) {
  return (
    <div className={`modal ${modalResponse.open ? 'modal_opened' : ''}`}>
      <div className="modal__container">
        <button className="modal__close" onClick={onClose} type="button" aria-label="Закрыть окно" />
        <img className="modal__img" alt="Иконка результата"
          src={modalResponse.status ? modalOkImg : modalErrorImg} 
        />
        <h2 className="modal__title">
          {modalResponse.status
            ? 'Вы успешно зарегистрировались!'
            : 'Что-то пошло не так! Попробуйте ещё раз.'}
        </h2>
      </div>
    </div>
  )
}

export default InfoToolTip;