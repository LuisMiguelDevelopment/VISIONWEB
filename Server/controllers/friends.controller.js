import { poolBody } from "../config/db.js";




export const getFriendRequest = async (req, res) => {
  const userId = req.user.UserId;

  try {
    const connection = await poolBody.connect();
    const request = connection.request();

    request.input("userId", userId);
    const friendRequests = await request.query(
      `SELECT u.NameUser AS RequestingUserName, u.LastName AS RequestingUserLastName, f.FriendRequestId, f.Status
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

    // Insert new friend request (no status needed in Friends table)
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

    const updateRows = await updateFriendRequestStatus(requestId, "ACCEPTED", connection); // Pass the connection

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
