
import Slider from "@/components/Slider";
import VideoCall from "@/components/VideoCall";


const Home = () => {
  
  return (
    <Slider>
      <h1>¡Hola!</h1>
      <VideoCall />
     
        <div>
          <p>Llamada entrante de </p>
          <button >Aceptar llamada</button>
        </div>

    </Slider>
  );
};

export default Home;
