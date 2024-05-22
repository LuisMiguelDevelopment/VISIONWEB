import { useState } from "react";
import styles from "../styles/SearchPeople.module.css";
import Search from "./Search";
import { IoPeople } from "react-icons/io5";
import { useAuth } from "@/context/authContext";
import Image from "next/image";
import pruebaimg from "../../public/Rectangle13.png";

const SearchPeople = () => {
  const { search, searchResults } = useAuth();
  const [query, setQuery] = useState("");

  const handleSearch = (value) => {
    setQuery(value);
    search(value);
  };

  return (
    <div className={styles.searchPeople}>
      <div className={styles.search_input}>
        <div className={styles.search}>
          <Search
            text={"Search"}
            additionalClass={styles.customSearch}
            inputClass={styles.customInput}
            onSearch={handleSearch}
          />
          {query && (
            <div className={styles.results}>
              <ul>
                {searchResults.map((person) => (
                  <div className={styles.list_users}>
                    <Image className={styles.image_profile} src={pruebaimg} />
                    <li className={styles.li} key={person.UserId}>
                      {person.NameUser}
                      {" " + person.LastName}
                    </li>
                  </div>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className={styles.request}>
          <IoPeople className={styles.iconRequest} />
          <span className={styles.spam}>Request</span>
        </div>
      </div>
    </div>
  );
};

export default SearchPeople;
