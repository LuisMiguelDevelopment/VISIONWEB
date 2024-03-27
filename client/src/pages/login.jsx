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
  } = useForm();

  const { signin, isAuthenticated } = useAuth();

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const onSubmited = async (data) => {
    try {
      await signin(data);
    } catch (error) {
      console.log(error);
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
                <Image
                  src={visionWeb}
                  width={35}
                  height={35}
                  alt="logo vision web"
                />
                <h1 className={styles.login_h1}>gin</h1>
              </div>
              <div className={styles.inputs}>
                <Input
                  type="email"
                  placeholder="Email"
                  register={register("Email", { required: true })}
                  icon="email"
                />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  register={register("PasswordKey", { required: true })}
                  showPassword={showPassword}
                  handlePasswordVisibility={handlePasswordVisibility}
                  icon={'password'}
                />
              </div>
              <Link href={'/recoveryPassword'} className={styles.p}>Forgot your password?</Link>
              <button className={styles.button}>Sent</button>
            </form>
          </div>
        </div>
      </NavForm>
    </div>
  );
};

export default Login;
