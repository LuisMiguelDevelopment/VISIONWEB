import styles from "../styles/Search.module.css"
import { IoMdSearch } from "react-icons/io";
const Search = ({text}) =>{
    return(
        <div className={styles.container_search}>
            <input type="text" placeholder={text} className={styles.input} />
            <IoMdSearch className={styles.icon}/>
        </div>
    )
}

export default Search;