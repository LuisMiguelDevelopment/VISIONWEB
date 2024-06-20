import React, { useState } from "react";
import styles from "../styles/SearchPeople.module.css";
import Search from "./Search";
import { IoPeople } from "react-icons/io5";
import { useAuth } from "../context/authContext";
import { useFriend } from "../context/friendContext";
import ModalRequest from "./ModalRequest";
import { IoIosSend } from "react-icons/io";

const SearchPeople = () => {
  const { search, searchResults, getImageUrl } = useAuth();
  const { sendFriendRequest } = useFriend();
  const [query, setQuery] = useState("");
  const [modalRequest, setModalRequest] = useState(false);

  const handleSearch = (value) => {
    setQuery(value);
    search(value);
  };

  const handleToggleModal = () => {
    setModalRequest(!modalRequest);
  };

  const getProfilePictureUrl = (friend) => {
    if (friend.ProfilePicture) {
      return getImageUrl(friend.ProfilePicture);
    } else {
      return '/profile.webp'; 
    }
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
              <>
                <ul className={styles.ul}>
                  {searchResults.map((person) => (
                    <div className={styles.list_users} key={person.UserId}>
                      <div className={styles.info_users}>
                        <img
                          className={styles.image_profile}
                          src={getProfilePictureUrl(person)}
                          alt={`${person.NameUser} ${person.LastName}`}
                          width={100}
                          height={100}
                        />
                        <li className={styles.li} key={person.UserId}>
                          {person.NameUser} {person.LastName} 
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
              </>
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
