// En tu archivo NavForm.js
import styles from "../styles/NavForm.module.css";
import visiowebIcon from "../../public/VISIONWEBLOGO.png";
import Image from "next/image";
import Link from "next/link";
import  { useRouter } from "next/router";

const NavForm = ({ children }) => {
    
    const router = useRouter();
 
  return (
    <div className={styles.general}>
      <div className={styles.navbar}>
        <div className={styles.navbar_logo}>
          <Image src={visiowebIcon} width={60} height={60} />
        </div>
        <ul className={styles.ul}>
          <li className={styles.li}>
            <Link href={"/login"} className={router.pathname === "/login" ? styles.active : styles.link} >Login</Link>
          </li>
          <li className={styles.li}>
            <Link href={"/register"} className={router.pathname === "/register" ? styles.active : styles.link} >Register</Link>
          </li>
        </ul>
      </div>
      {children} 
    </div>
  );
};

export default NavForm;
