import { useState } from "react";
import styles from "../styles/Search.module.css";
import { IoMdSearch } from "react-icons/io";

const Search = ({ text, additionalClass, inputClass, onSearch }) => {

  const handleChange = (e) => {
    const value = e.target.value;
    onSearch(value);
  };

  return (
    <div
      className={`${styles.container_search} ${
        additionalClass ? additionalClass : ""
      }`}
    >
      <input
        type="text"
        placeholder={text}
        className={`${styles.input}${inputClass ? inputClass : ""}`}
        onChange={handleChange}
      />
      <IoMdSearch className={styles.icon} />
    </div>
  );
};

export default Search;
