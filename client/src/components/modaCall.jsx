import styles from "../styles/Modal.module.css";
import Image from "next/image";
import profile from "../../public/Rectangle13.png";
import { IoCloseOutline } from "react-icons/io5";
import { FaPhone } from "react-icons/fa6";
const ModalCall = ({handleCallAccept , handleCancell}) => {
  return (
    <div className={styles.general}>
      <div className={styles.modal_info}>
        <div className={styles.modal_img}>
          <Image src={profile} className={styles.img} />
        </div>
        <div className={styles.modal_info_call}>
          <span className={styles.span}>Usuario x te llama</span>
          <p className={styles.p}>is calling you</p>
        </div>
        <div className={styles.buttons}>
          <button className={`${styles.button} ${styles.button_green}`} onClick={handleCallAccept}>
            <FaPhone/>
          </button>
          <button className={`${styles.button} ${styles.button_red}`} onClick={ handleCancell } >
            <IoCloseOutline />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCall;
