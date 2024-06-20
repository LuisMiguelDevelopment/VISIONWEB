import { useState } from "react";
import styles from "../styles/SearchFriends.module.css";
import { IoMdSearch } from "react-icons/io";
import { useAuth } from "../context/authContext";

const SearchFriends = ({ text, additionalClass, inputClass }) => {
  const { searchFriends } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value === "") {
      searchFriends(null);
    } else {
      searchFriends(value);
    }
  };


  return (
    <div
      className={`${styles.container_search} ${additionalClass ? additionalClass : ""
        }`}
    >
      <input
        type="text"
        placeholder={text}
        className={`${styles.input}${inputClass ? inputClass : ""}`}
        value={searchTerm}
        onChange={handleChange}
      />
      <IoMdSearch className={styles.icon} />
    </div>
  );
};

export default SearchFriends;
