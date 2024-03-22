import "./login.css";
import FormLogin from "@/app/components/organisms/FormLogin/FormLogin";
export default function Login() {
  return (
    <div className="pages__login">
      <div className="color__white"></div>
      <div className="form__container">
        <FormLogin/>
      </div>
      <div className="color__blue"></div>
    </div>
  );
}
