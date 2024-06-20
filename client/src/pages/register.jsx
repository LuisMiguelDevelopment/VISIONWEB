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
      await login(data); // Intenta iniciar sesión con los datos del formulario
      // Si el login tiene éxito, el usuario será redirigido automáticamente
    } catch (error) {
      console.error("Login error:", error); // Loguea el error en la consola para depuración
      // Muestra el mensaje de error al usuario, por ejemplo, usando un estado local
      // Opcionalmente podrías definir un estado local para almacenar el error
      // Y mostrarlo en el formulario
    }
  };

  return (
    <div className={styles.general}>
      <NavForm>
        <div className={styles.page_register}>
          <div className={styles.form_container}>
            <form className={styles.form} onSubmit={handleSubmit(onSubmited)}>
              <div className={styles.register_title}>
                <h1 className={styles.h1}>Register</h1>
              </div>
              <div className={styles.inputs}>
                <Input
                  type="text"
                  placeholder="Full Name"
                  register={register("NameUser", { required: "User Name is required" })}
                  icon="user"
                />
                {errors.NameUser && <p className={styles.error_message}>{errors.NameUser.message}</p>}
                <Input
                  type="text"
                  placeholder="Last Name"
                  register={register("LastName", { required: "Last Name is required" })}
                  icon="user"
                />
                {errors.LastName && <p className={styles.error_message}>{errors.LastName.message}</p>}
                <Input
                  type="email"
                  placeholder="Email"
                  register={register("Email", { required: "Email is required", pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' } })}
                  icon="email"
                />
                {errors.Email && <p className={styles.error_message}>{errors.Email.message}</p>}
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  register={register("PasswordKey", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters long" } })}
                  showPassword={showPassword}
                  handlePasswordVisibility={handlePasswordVisibility}
                  icon="password"
                />
                {errors.PasswordKey && <p className={styles.error_message}>{errors.PasswordKey.message}</p>}
                <Input
                  type="date"
                  placeholder="Date of Birth"
                  register={register("DateBirth", { required: "Date of Birth is required" })}
                />
                {errors.DateBirth && <p className={styles.error_message}>{errors.DateBirth.message}</p>}
              </div>
              <button className={styles.button}>Submit</button>
            </form>
          </div>
        </div>
      </NavForm>
    </div>
  );
};

export default Register;
