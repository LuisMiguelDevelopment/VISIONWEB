import "./formLogin.css";
import TitleIcon from "../../molecules/titleIcon/TitleIcon";
import Input from "../../molecules/input/Input";
import Linkto from "../../atoms/link/Link";
import Button from "../../atoms/buttons/Button";
const FormLogin = ({
  text,
  text1,
  text2,
  type,
  level,
  level2,
  typeIcons,
  placeholders,
  textButton,
  typeInput,
  variant,
  to,
  textLink
}) => {
  return (
    <form className="form__login">
      <TitleIcon
        level={level}
        text1={text1}
        type={type}
        level2={level2}
        text2={text2}
      />
      {placeholders.map((placeholder, index) => (
        <Input
          key={index}
          typeInput={typeInput[index]}
          type={typeIcons[index]}
          placeholder={placeholder}
        />
      ))}

      <Linkto to={to} textLink={textLink} />
      <Button text={textButton} variant={variant} />
    </form>
  );
};

export default FormLogin;
