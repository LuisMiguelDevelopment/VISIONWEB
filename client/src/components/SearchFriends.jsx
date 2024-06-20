// Search.jsx

import { useState } from "react";
import styles from "../styles/SearchFriends.module.css";
import { IoMdSearch } from "react-icons/io";
import { useAuth } from "../context/authContext"; // Importa el contexto de autenticación

const SearchFriends = ({ text, additionalClass, inputClass }) => {
  const { searchFriends } = useAuth(); // Obtiene la función searchFriends del contexto de autenticación
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value); // Actualiza el estado local con el término de búsqueda
    searchFriends(value); // Llama a la función searchFriends del contexto con el término de búsqueda
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
        value={searchTerm}
        onChange={handleChange}
      />
      <IoMdSearch className={styles.icon} />
    </div>
  );
};

export default SearchFriends;
