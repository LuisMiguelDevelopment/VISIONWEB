
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/authContext";
import { useRouter } from "next/router";
import styles from "../styles/Register.module.css";
import NavForm from "../components/NavForm";
import Input from "../components/Input"; 

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
                <Input
                  type="text"
                  placeholder="Full Name"
                  register={register("NameUser",{required:true})}
                  icon="user"
                />
                <Input
                  type="text"
                  placeholder="Last Name"
                  register={register("LastName",{required:true})}
                  icon="user"
                />
                <Input
                  type="email"
                  placeholder="Email"
                  register={register("Email",{required:true})}
                  icon="email"
                />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  register={register("PasswordKey",{required:true})}
                  showPassword={showPassword}
                  handlePasswordVisibility={handlePasswordVisibility}
                  icon={'password'}
                />
                <Input
                  type="date"
                  placeholder="Date birth"
                  register={register("DateBirth",{required:true})}
                />
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
