import { useState } from "react";
import { useAuth } from "@/context/authContext";
import { useForm } from "react-hook-form";
import { LuEye } from "react-icons/lu";
import { IoMdEyeOff } from "react-icons/io";
import NavForm from "../components/NavForm";
import { useRouter } from "next/router";
import styles from "../styles/UpdatePassword.module.css";
import Input from "../components/Input"; // Importa el componente Input

const UpdatePassword = () => {
  const router = useRouter();
  const { register, handleSubmit } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const { updatePassword } = useAuth();

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data) => {
    try {
      const token = router.query.token; // Extrae el token de la URL
      const { newPassword } = data;
  
      console.log("Token:", token);
      console.log("New Password:", newPassword);
  
      // Check if newPassword is defined
      if (!newPassword) {
        console.log("New password is not defined");
        return;
      }
  
      await updatePassword(token, newPassword);
      router.push('/login');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={styles.general}>
      <NavForm>
        <div className={styles.container_form}>
          <form
            action=""
            className={styles.form}
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className={styles.form_title}>
              <h1 className={styles.h1}>Update Password</h1>
            </div>
            <div className={styles.inputs}>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                register={register("newPassword", { required: true })}
                icon={"password"}
                handlePasswordVisibility={handlePasswordVisibility}

              />
            </div>
            <button type="submit" className={styles.button}>
              Sent
            </button>
          </form>
        </div>
      </NavForm>
    </div>
  );
};

export default UpdatePassword;
