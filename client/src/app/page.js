import styles from "./page.module.css";
import TitleIcon from "./components/molecules/titleIcon/TitleIcon";
export default function Home() {
  return (
    <main className={styles.main}>
      <h1>hola</h1>
      <TitleIcon level={'h1'} text1={'L'} type={'visionweb'} level2={'h1'} text2={'GIN'} />
    </main>
  );
}
