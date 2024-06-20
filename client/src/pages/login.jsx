import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/authContext";
import { useRouter } from "next/router";
import styles from "../styles/Login.module.css";
import visionWeb from "../../public/VISIONWEBLOGO.png";
import Image from "next/image";
import NavForm from "../components/NavForm";
import Link from "next/link";
import Input from "../components/Input";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const { signin, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmited = async (data) => {
    try {
      if (data.PasswordKey.length < 6) {

        setError("PasswordKey", {
          type: "manual",
          message: "Password must be at least 6 characters long",
        });
        return;
      }

      await signin(data);

    } catch (error) {
      console.error("Login error:", error);

      if (error.response && error.response.data) {
        const serverErrors = error.response.data;


        serverErrors.forEach((errorMessage) => {
          switch (errorMessage) {
            case "Invalid credentials":

              setError("Email", { message: "Invalid email or password" });
              setError("PasswordKey", { message: "Invalid email or password" });
              break;
            default:

              break;
          }
        });
      }
    }
  };

  return (
    <div className={styles.general}>
      <NavForm>
        <div className={styles.page_login}>
          <div className={styles.form_container}>
            <form className={styles.form} onSubmit={handleSubmit(onSubmited)}>
              <div className={styles.login_title}>
                <h1 className={styles.login_h1}>L</h1>
                <Image src={visionWeb} width={35} height={35} alt="logo vision web" />
                <h1 className={styles.login_h1}>gin</h1>
              </div>
              <div className={styles.inputs}>
                <Input
                  type="email"
                  placeholder="Email"
                  register={register("Email", { required: "Email is required" })}
                  icon="email"
                />
                {errors.Email && <p className={styles.error_message}>{errors.Email.message}</p>}
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  register={register("PasswordKey", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters long" }
                  })}
                  showPassword={showPassword}
                  handlePasswordVisibility={handlePasswordVisibility}
                  icon="password"
                />
                {errors.PasswordKey && <p className={styles.error_message}>{errors.PasswordKey.message}</p>}
              </div>
              <Link href="/recoveryPassword" className={styles.p}>
                Forgot your password?
              </Link>
              <button className={styles.button}>Send</button>
            </form>
          </div>
        </div>
      </NavForm>
    </div>
  );
};

export default Login;
