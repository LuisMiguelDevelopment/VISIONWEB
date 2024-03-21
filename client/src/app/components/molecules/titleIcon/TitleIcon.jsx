import './titleIcon.css';
import Title from "../../atoms/Title/Title";
import Icon from "../../atoms/icons/Icon";

const TitleIcon = ({ text1 , text2, type , level , level2 }) => {
  return (
    <div className="titleIcon">
      <Title text={text1}  level={level} />
        <Icon type={type} />
      <Title text={text2} level={level2} />
    </div>
  );
};

export default TitleIcon;
