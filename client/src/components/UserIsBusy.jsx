import styles from '../styles/UserIsBusy.module.css';
import { IoClose } from "react-icons/io5";

const UserIsBusy = ({ handleClose }) => {
    return (
        <div className={styles.general}>
            <div className={styles.icon}>
                <IoClose onClick={handleClose} className={styles.closeIcon} />
            </div>
            <div className={styles.text}>
                <h2 className={styles.message}>The user is <span className={styles.span}>busy</span></h2>
            </div>
        </div>
    );
}

export default UserIsBusy;
