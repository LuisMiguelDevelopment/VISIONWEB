import './input.css';
import Icon from "../../atoms/icons/Icon";
const Input = ({ typeInput, type, placeholder }) => {
  return (
    <div className="input-container">
      <input className='input' type={typeInput} placeholder={placeholder} />
      <Icon type={type} />
    </div>
  );
};

export default Input;
