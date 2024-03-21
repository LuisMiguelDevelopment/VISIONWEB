import "./login.css";
import FormLogin from "@/app/components/organisms/FormLogin/FormLogin";
export default function Login() {
  return (
    <div className="pages__login">
      <div className="color__white"></div>
      <div className="form__container">
        <FormLogin
          level={"h1"}
          text1={"L"}
          type={"visionweb"}
          level2={"h1"}
          text2={"gin"}
          typeInput={["email", "password"]}
          placeholders={["Email", "Password"]}
          typeIcons={["mail", "eye"]}
          to={'ss'}
          textLink={'Forgot your password?'}
          textButton={"Send"}
          variant={"buttonBlue"}
        />
      </div>
      <div className="color__blue"></div>
    </div>
  );
}
