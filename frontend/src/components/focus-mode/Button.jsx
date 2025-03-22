const Button = ({ title, activeClass, _callback }) => {
  return (
    <button className={`timer-button ${activeClass || ''}`} onClick={_callback}>
      {title}
    </button>
  );
};

export default Button;