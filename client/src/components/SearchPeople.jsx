import { useState } from "react";
import styles from "../styles/SearchPeople.module.css";
import Search from "./Search";
import { IoPeople } from "react-icons/io5";
import { useAuth } from "@/context/authContext";
import { useFriend } from "@/context/friendContext";
import Image from "next/image";
import pruebaimg from "../../public/Rectangle13.png";
import ModalRequest from "./ModalRequest";
import { IoIosSend } from "react-icons/io";

const SearchPeople = () => {
  const { search, searchResults } = useAuth();
  const [query, setQuery] = useState("");
  const { sendFriendRequest } = useFriend();
  const [modalRequest, setModalRequest] = useState(false);

  const handleSearch = (value) => {
    setQuery(value);
    search(value);
  };

  const handleToggleModal = () => {
    setModalRequest(!modalRequest);
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
              <ul className={styles.ul}>
                {searchResults.map((person) => (
                  <div className={styles.list_users}>
                    <div className={styles.info_users}>
                      <Image className={styles.image_profile} src={pruebaimg} />
                      <li className={styles.li} key={person.UserId}>
                        {person.NameUser}
                        {" " + person.LastName}
                      </li>
                    </div>
                    <div className={styles.button_send}>
                      <button
                        className={styles.requestButton}
                        onClick={() => sendFriendRequest(person.UserId)}
                      >
                        <IoIosSend />
                      </button>
                    </div>
                  </div>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className={styles.request} onClick={handleToggleModal}>
          <IoPeople className={styles.iconRequest} />
          <span className={styles.spam}>Request</span>
          <ModalRequest
            modalRequest={modalRequest}
            setModalRequest={setModalRequest}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchPeople;
