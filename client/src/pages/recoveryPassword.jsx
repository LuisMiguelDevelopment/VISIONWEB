import { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import Image from "next/image";
import visionweb from "../../public/VISIONWEBLOGO.png";
import NavForm from "../components/NavForm";
import Input from "../components/Input"; // Importa el componente Input

import styles from "../styles/Recovery.module.css";

const RecoveryPassword = () => {
  const { register, handleSubmit } = useForm();
  const { recovery } = useAuth();
  const router = useRouter();

  const onSubmited = async (data) => {
    try {
      await recovery(data);
      router.push('/login')
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
            onSubmit={handleSubmit(onSubmited)}
          >
            <div className={styles.form_title}>
              <h1 className={styles.h1}>Rec</h1>
              <Image
                className={styles.img}
                src={visionweb}
                height={40}
                width={40}
                alt="vision web logo"
              />
              <h1 className={styles.h1}>very</h1>
            </div>
            <h1 className={styles.h1_password}>password</h1>
            <div className={styles.inputs}>
              <Input
                type="email"
                placeholder="Email"
                register={register("Email", { required: true })}
                icon="email"
              />
            </div>
            <button className={styles.button}>Sent</button>
          </form>
        </div>
      </NavForm>
    </div>
  );
};

export default RecoveryPassword;
