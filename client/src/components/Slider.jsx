import { useEffect, useState } from "react";
import styles from "../styles/Slider.module.css";
import Search from "./Search";
import ListFriends from "./ListFriends";
import { FaBars } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import Profile_Slider from "./Profile";

const Slider = ({ children, handleCall }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={styles.general}>
      <div className={styles.children_container}>{children}</div>
      <div className={styles.buttons}>
        <button onClick={toggleMenu} className={`${styles.button_bar} ${styles.button}`}>
          <FaBars />
        </button>
      </div>

      <div className={`${styles.container} ${isMenuOpen ? styles.mobile_menu: ''}`}>
        <div className={styles.container_search}>
          <Search text={"Search my friends"} />
        </div>
        <div className={styles.list_friends}>
          <ListFriends handleCall={handleCall} />
        </div>
       
        <div className={styles.buttons}>
          <button  onClick={toggleMenu} className={`${styles.button_close} ${styles.button} `}>
            <IoClose />
          </button>
        </div>
        <div className={styles.profile}>
          <Profile_Slider />
        </div>
      </div>
    </div>
  );
};

export default Slider;
