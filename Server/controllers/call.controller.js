import { poolBody } from "../config/db.js";

export const handleCall = (io) => {
  io.on("connection", (socket) => {
    socket.emit("me", socket.id);
    let peerId;
    let startTime;

    socket.on("disconnect", async () => {
      if (peerId) {
        const endTime = new Date();
        const callHistoryCreated = await createCallHistory(
          peerId,
          socket.id,
          startTime,
          endTime
        );
      }
      socket.broadcast.emit("callEnded");
    });

    socket.on("callUser", async (data) => {
      const userId = data.from;
      const areFriends = await checkFriendship(userId, data.userToCall);
      if (!areFriends) {
        socket.emit("callNotAllowed", {
          message: "You are not friends with this user",
        });
        return;
      }

      peerId = userId;
      startTime = new Date();
      io.to(data.userToCall).emit("callUser", {
        signal: data.signalData,
        from: userId,
        name: data.name,
      });
    });
    socket.on("answerCall", (data) => {
      io.to(data.to).emit("callAccepted", data.signal);
    });
  });

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

  async function createCallHistory(callerId, calleId, startTime, endTime) {
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
      console.error("Error creatin call histoy: ", error);
      return false;
    }
  }
};
