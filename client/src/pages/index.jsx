import VideoCall from "@/components/VideoCall";
import Slider from "@/components/Slider";
import styles from "../styles/Home.module.css";

const Home = () => {
  return (
    <Slider>
      <div className={styles.general}>
        <VideoCall />
        
      </div>
    </Slider>
  );
};

export default Home;
