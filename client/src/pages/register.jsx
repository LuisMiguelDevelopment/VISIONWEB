import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/authContext";
import { useRouter } from "next/router";

import styles from "../styles/Register.module.css";
import NavForm from "../components/NavForm";
import { CiUser } from "react-icons/ci";
import { MdOutlineMailOutline } from "react-icons/md";
import { LuEye } from "react-icons/lu";
import { IoMdEyeOff } from "react-icons/io";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { login, isAuthenticated } = useAuth();

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
      await login(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={styles.general}>
      <NavForm>
        <div className={styles.page_register}>
          <div className={styles.form_container}>
            <form action="" className={styles.form} onSubmit={handleSubmit(onSubmited)}>
              <div className={styles.register_title}>
                <h1 className={styles.h1}>Register</h1>
              </div>
              <div className={styles.inputs}>
                <div className={styles.container_input}>
                  <input
                    type="text"
                    placeholder="Full Name"
                    className={styles.input}
                    {...register("NameUser",{required:true})}
                  />
                  <CiUser className={styles.icon} />
                </div>
                <div className={styles.container_input}>
                  <input
                    type="text"
                    placeholder="Last Name"
                    className={styles.input}
                    {...register("LastName",{required:true})}
                  />
                  <CiUser className={styles.icon} />
                </div>
                <div className={styles.container_input}>
                  <input
                    type="email"
                    placeholder="Email"
                    className={styles.input}
                    {...register("Email",{required:true})}
                  />
                  <MdOutlineMailOutline className={styles.icon} />
                </div>
                <div className={styles.container_input}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className={styles.input}
                    {...register("PasswordKey",{required:true})}
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
                <div className={styles.container_input}>
                  <input
                    type="date"
                    placeholder="Date birth"
                    className={styles.input}
                    {...register("DateBirth",{required:true})}
                  />
                </div>
              </div>
              <button className={styles.button}>Sent</button>
            </form>
          </div>
        </div>
      </NavForm>
    </div>
  );
};

export default Register;
