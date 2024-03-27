import { poolBody } from "../config/db.js";

export const handleCall = (io) => {
  const connectedUsers = {};

  io.on("connection", (socket) => {
    const userId = socket.request._query.UserId; // Obtener el UserId desde el socket
    connectedUsers[userId] = true;
    emitConnectedUsers();

    socket.on("disconnect", () => {
      delete connectedUsers[userId];
      emitConnectedUsers();
    });

    // Resto del código para manejar las llamadas...
  });

  async function emitConnectedUsers() {
    console.log("Connected users:", Object.keys(connectedUsers));
    io.emit("connectedUsers", Object.keys(connectedUsers));
  }

  // Resto del código para manejar las llamadas...

  async function checkFriendship(userId1, userId2) {
    try {
      const connection = await poolBody.connect();
      const request = connection.request();

      request.input("UserId1", userId1);
      request.input("UserId2", userId2);
      const result = await request.query(
        "SELECT * FROM FriendsList WHERE (UserId1 = @UserId1 AND UserId2 = @UserId2) OR (UserId1 = @UserId2 AND UserId2 = @UserId1)"
      );
      await connection.close();
      return result.recordset.length > 0;
    } catch (error) {
      console.log(error);
      console.error("Error checking friendship: ", error);
      return false;
    }
  }

  async function createCallHistory(callerId, calleeId, startTime, endTime) {
    const duration = Math.floor((endTime - startTime) / 1000);
    try {
        const connection = await poolBody.connect();
        const request = connection.request();

        request.input("CallerId", callerId);
        request.input("CalleeId", calleeId);
        request.input("StartTime", startTime);
        request.input("EndTime", endTime);
        request.input("Duration", duration);
        await request.query(
            "INSERT INTO CallHistory (CallerId, CalleeId, StartTime, EndTime, Duration) VALUES (@CallerId, @CalleeId, @StartTime, @EndTime, @Duration)"
        );
        await connection.close();
        return true;
    } catch (error) {
        console.error("Error creating call history: ", error);
        return false;
    }
  }
};
