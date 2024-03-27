import styles from "../styles/Slider.module.css";
import Search from "./Search";
import ListFriends from "./ListFriends";
const Slider = ({ children }) => {
  return (
    <div className={styles.general}>
      <div className={styles.children_container}>{children}</div>
      <div className={styles.container}>
        <div className={styles.container_search}>
          <Search text={"Search my friends"} />
        </div>
        <div className={styles.list_friends}>
            <ListFriends  />
        </div>
      </div>
    </div>
  );
};

export default Slider;
