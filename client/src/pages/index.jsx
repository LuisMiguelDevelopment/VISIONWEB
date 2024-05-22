import VideoCall from "@/components/VideoCall";
import Slider from "@/components/Slider";
import SearchPeople from "@/components/SearchPeople";
import styles from "../styles/Home.module.css";

const Home = () => {
  return (
    <Slider>
      <div className={styles.general}>
        <div className={styles.elements}>
          <SearchPeople />
          <VideoCall />
        </div>
      </div>
    </Slider>
  );
};

export default Home;
