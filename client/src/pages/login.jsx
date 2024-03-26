// En tu archivo Login.js
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/authContext";
import { useRouter } from "next/router";
import styles from "../styles/Login.module.css";
import visionWeb from "../../public/VISIONWEBLOGO.png";
import Image from "next/image";
import { MdOutlineMailOutline } from "react-icons/md";
import { LuEye } from "react-icons/lu";
import { IoMdEyeOff } from "react-icons/io";

// Importa NavForm sin llaves
import NavForm from "../components/NavForm";

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
                <div className={styles.container_input}>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="Email"
                    {...register("Email", { required: true })}
                  />
                  <MdOutlineMailOutline className={styles.icon} />
                </div>
                <div className={styles.container_input}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={styles.input}
                    placeholder="Password"
                    {...register("PasswordKey", { required: true })}
                  />
                  {showPassword ? (
                    <LuEye
                      className={styles.icon}
                      onClick={handlePasswordVisibility}
                    />
                  ) : (
                    <IoMdEyeOff
                      className={styles.icon}
                      onClick={handlePasswordVisibility}
                    />
                  )}
                </div>
              </div>
              <p className={styles.p}>Forgot your password?</p>
              <button className={styles.button}>Sent</button>
            </form>
          </div>
        </div>
      </NavForm>
    </div>
  );
};

export default Login;
