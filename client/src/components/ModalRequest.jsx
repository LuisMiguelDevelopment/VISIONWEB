import { useState, useEffect } from "react";
import styles from "../styles/ModalRquest.module.css";
import pruebaimg from "../../public/Rectangle13.png";
import Image from "next/image";
import { FaCheck } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { useFriend } from "../context/friendContext"; // Ajusta la ruta según sea necesario

const ModalRequest = ({ modalRequest, setModalRequest }) => {
  const { requestList, acceptRequest, rejectRequest } = useFriend();
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    if (requestList && requestList.friendRequests) {
      // Filtra las solicitudes pendientes
      const pending = requestList.friendRequests.filter(
        (request) => request.Status === "PENDING"
      );
      setPendingRequests(pending);
    }
  }, [requestList]);

  const handleToggleModal = () => {
    setModalRequest(!modalRequest);
  };

  return (
    <div
      className={`${styles.modal_request} ${modalRequest && styles.open}`}
      onClick={handleToggleModal}
    >
      <div className={styles.container_user}>
        {pendingRequests.length === 0 ? (
          <div className={styles.no_requests}>
            <p>No hay solicitudes pendientes de amistad. 🥺</p>
          </div>
        ) : (
          pendingRequests.map((request) => (
            <div key={request.FriendRequestId} className={styles.info_friend}>
              <div className={styles.info_request}>
                <Image
                  className={styles.image_profile}
                  src={pruebaimg}
                  alt="Profile"
                  width={50}
                  height={50}
                />
                <span className={styles.span}>
                  {`${request.RequestingUserName} ${request.RequestingUserLastName}`}
                </span>
              </div>
              <div className={styles.buttons_container}>
                <button
                  className={`${styles.buttons} ${styles.button_check}`}
                  onClick={() => acceptRequest(request.FriendRequestId)}
                >
                  <FaCheck className={styles.icons} />
                </button>
                <button
                  className={`${styles.buttons} ${styles.button_close}`}
                  onClick={() => rejectRequest(request.FriendRequestId)}
                >
                  <IoClose className={styles.icons} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ModalRequest;
