import { poolBody } from "../config/db.js";

const userSockets = new Map();

export const ListFriends = async (req, res) => {
  const userId = req.user.UserId;

  try {
    const connection = await poolBody.connect();
    const request = connection.request();

    request.input("userId", userId);

    const friendList = await request.query(
      `SELECT u.UserId, u.NameUser, u.LastName, u.ProfilePicture
      FROM Users u
      JOIN FriendsList fl ON (u.UserId = fl.UserId1 OR u.UserId = fl.UserId2)
      WHERE u.UserId != @userId AND (fl.UserId1 = @userId OR fl.UserId2 = @userId)`
    );

    await connection.close();
    return res.status(200).json({ friendList: friendList.recordset });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error getting friend list" });
  }
};




export const getFriendProfile = async (req, res) => {
  const friendId = parseInt(req.params.friendId);
  const userId = req.user.UserId;

  try {
    const connection = await poolBody.connect();
    const request = connection.request();

    request.input("userId", userId);
    request.input("friendId", friendId);
    const friendshipCheck = await request.query(
      `SELECT COUNT(*) AS friendshipExists
       FROM FriendsList
       WHERE (UserId1 = @userId AND UserId2 = @friendId)
       OR (UserId1 = @friendId AND UserId2 = @userId)`
    );

    if (friendshipCheck.recordset[0].friendshipExists === 0) {
      await connection.close();
      return res.status(403).json({ message: "You are not friends with this user" });
    }

    const friendDetails = await request.query(
      `SELECT UserId, NameUser, LastName, ProfilePicture
       FROM Users
       WHERE UserId = @friendId`
    );

    if (friendDetails.recordset.length === 0) {
      await connection.close();
      return res.status(404).json({ message: "Friend not found" });
    }

    await connection.close();

    return res.status(200).json({ friendProfile: friendDetails.recordset[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error retrieving friend profile" });
  }
};







export const requestFriend = (io) => {
  io.on("connection", (socket) => {
    socket.on("setUserId2", (userId) => {
      userSockets.set(userId, socket.id);
      console.log("User connected:", userId);
      console.log("Current userSockets:", userSockets);
    });

    socket.on("reconnect", (userId) => {
      userSockets.set(userId, socket.id);
      console.log("Usuario reconectado:", userId, "Nuevo socket:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      // Eliminar el socket del mapa de usuarios cuando se desconecta
      for (const [key, value] of userSockets.entries()) {
        if (value === socket.id) {
          userSockets.delete(key);
          break;
        }
      }
    });


    socket.on("sendFriendRequest", (data) => {
      const { requestedUserId } = data;
      const requestAcceptSocket = userSockets.get(requestedUserId);

      if (requestAcceptSocket) {
        io.to(requestAcceptSocket).emit("requestSend", { requestedUserId });
        console.log("Emit requestAccept to:", requestAcceptSocket);
      } else {
        console.error("Socket not found for user:", requestedUserId);
      }
    });


    socket.on("acceptFriend",async (data)=>{
      console.log(JSON.stringify(data) + ' hey hey mi perro');
      const {  requestingUserId , requestedUserId}  = data;
      console.log(requestingUserId)
      const requestAcceptSocketId = userSockets.get(requestingUserId);
      const requestAcceptSocket = userSockets.get(requestedUserId)
      if(requestAcceptSocketId){
        io.to(requestAcceptSocketId).emit("acceptSend",{ requestingUserId, requestedUserId})
        io.to(requestAcceptSocket).emit("acceptSend",{ requestingUserId, requestedUserId})
      }else{
        console.error("Socket not foun for user: ", requestAcceptSocketId)
      }

    })

  });
};

export const getFriendRequest = async (req, res) => {
  const userId = req.user.UserId;

  try {
    const connection = await poolBody.connect();
    const request = connection.request();

    request.input("userId", userId);
    const friendRequests = await request.query(
      `SELECT u.NameUser AS RequestingUserName, u.LastName AS RequestingUserLastName, 
              u.ProfilePicture,
              f.FriendRequestId, f.Status, f.RequestingUserId, f.RequestedUserId
       FROM Friends f
       JOIN Users u ON f.RequestingUserId = u.UserId
       WHERE f.RequestedUserId = @userId AND f.Status IN ('PENDING', 'ACCEPTED')`
    );

    await connection.close();
    return res.status(200).json({ friendRequests: friendRequests.recordset });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error getting friend requests" });
  }
};

export const sendFriendRequest = async (req, res) => {
  const { requestedUserId } = req.body;
  const requestingUserId = req.user.UserId; // Obtener el UserId del token de autenticación

  try {
    // Verificar que el requestingUserId sea diferente al requestedUserId
    if (requestingUserId === requestedUserId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const connection = await poolBody.connect();
    const request = connection.request();

    request.input("userId1", requestingUserId);
    request.input("userId2", requestedUserId);

    const existingFriendship = await request.query(
      `SELECT * FROM FriendsList WHERE (UserId1 = @userId1 AND UserId2 = @userId2) OR (UserId1 = @userId2 AND UserId2 = @userId1)`
    );

    if (existingFriendship.recordset.length > 0) {
      return res.status(409).json({ message: "Users are already friends" });
    }

    // Verificar si ya existe una solicitud de amistad pendiente
    const existingRequest = await request.query(
      `SELECT * FROM Friends WHERE (RequestingUserId = @userId1 AND RequestedUserId = @userId2) OR (RequestingUserId = @userId2 AND RequestedUserId = @userId1) AND Status = 'PENDING'`
    );

    if (existingRequest.recordset.length > 0) {
      return res
        .status(409)
        .json({ message: "Friend request already pending" });
    }

    // Insertar nueva solicitud de amistad (no es necesario el estado en la tabla Friends)
    request.input("requestingUserId", requestingUserId);
    request.input("requestedUserId", requestedUserId);

    await request.query(
      `INSERT INTO Friends (RequestingUserId, RequestedUserId) VALUES (@requestingUserId, @requestedUserId)`
    );

    await connection.close();

    return res
      .status(201)
      .json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error sending friend request" });
  }
};


export const acceptFriendRequest = async (req, res) => {
  const requestId = parseInt(req.params.requestId);
  const userId = req.user.UserId;

  try {
    const connection = await poolBody.connect();

    if (!requestId || isNaN(requestId)) {
      await connection.close();
      return res.status(400).json({ message: "Invalid request ID" });
    }

    const request = connection.request();

    request.input("requestId", requestId);

    const requestDetails = await request.query(
      "SELECT RequestingUserId FROM Friends WHERE FriendRequestId = @requestId"
    );

    if (requestDetails.recordset.length === 0) {
      await connection.close();
      return res.status(404).json({ message: "Request not found" });
    }

    const requestingUserId = requestDetails.recordset[0].RequestingUserId;

    request.input("RequestingUserId", requestingUserId);
    request.input("UserId", userId);

    const usersExistQuery = await request.query(
      "SELECT UserId FROM Users WHERE UserId IN (@RequestingUserId, @UserId)"
    );

    if (usersExistQuery.recordset.length < 2) {
      await connection.close();
      return res.status(404).json({ message: "One or more users not found" });
    }

    const updateRows = await updateFriendRequestStatus(
      requestId,
      "ACCEPTED",
      connection
    ); // Pass the connection

    if (updateRows > 0) {
      const requestInsert = connection.request();
      requestInsert.input("userId1", userId);
      requestInsert.input("requestingUserId", requestingUserId);
      await requestInsert.query(
        `INSERT INTO FriendsList (UserId1, UserId2) VALUES (@userId1, @requestingUserId)`
      );
    }

    await connection.close(); // Close connection after all queries

    return res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error accepting friend request" });
  }
};

export const deleteRequestFriend = async (req, res) => {
  const requestId = parseInt(req.params.requestId);
  const userId = req.user.UserId;
  try {
    const connection = await poolBody.connect();
    const request = connection.request();

    if (!requestId || isNaN(requestId)) {
      await connection.close();
      return res.status(400).json({ message: "Invalid request ID" });
    }

    request.input("requestId", requestId);

    const requestDetails = await request.query(`
    SELECT RequestingUserId, RequestedUserId
    FROM Friends
    WHERE FriendRequestId = @requestId`);

    if (requestDetails.recordset.length === 0) {
      await connection.close();
      return res.status(404).json({ message: "Request not found" });
    }

    request.input("UserId", userId);

    await request.query(`
    DELETE FROM Friends
    WHERE FriendRequestId = @requestId
    AND (RequestingUserId = @userId OR RequestedUserId = @userId)`);

    await connection.close();

    res.status(200).json({ message: "Delete request successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error delete request friend" });
  }
};

const updateFriendRequestStatus = async (requestId, status, connection) => {
  try {
    const request = connection.request();

    request.input("requestId", requestId);
    request.input("status", status);

    const result = await request.query(
      "UPDATE Friends SET Status = @status WHERE FriendRequestId = @requestId"
    );

    return result.rowsAffected[0];
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteFriend = async (req, res) => {
  const userId = req.user.UserId;
  const friendId = parseInt(req.params.friendId);

  try {
    const connection = await poolBody.connect();
    const request = connection.request();

    if (friendId === userId) {
      return res.status(401).json({ message: "Invalid user ID" });
    }

    request.input("userId1", userId);
    request.input("userId2", friendId);

    const friendListCheck = await request.query(`
    SELECT COUNT(*) AS friendCount
    FROM FriendsList 
    WHERE (UserId1 = @userId1 OR UserId2 = @userId1)`);

    const friendCount = friendListCheck.recordset[0].friendCount;

    if (friendCount === 0) {
      await connection.close();
      return res.status(404).json({ message: "No friends to delete" });
    }

    await request.query(`
      DELETE FROM FriendsList 
      WHERE (UserId1 = @userId1 AND UserId2 = @userId2) 
      OR (UserId1 = @userId2 AND UserId2 = @userId1)
    `);

    await request.query(`
    DELETE FROM Friends
    WHERE (RequestingUserId = @userId1 AND RequestedUserId = @userId2)
    OR (RequestingUserId = @userId2 AND RequestedUserId = @userId1)
    `);

    await connection.close();

    console.log("Friend removed successfully");
    return res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error deleting friend" });
  }
};
