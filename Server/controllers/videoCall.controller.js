import { poolBody } from "../config/db.js";

const userSockets = new Map();

const callRoom = new Map();

export const callUser = (io) => {
  io.on("connection", async (socket) => {
    socket.on("setUserId", (userId) => {
      // Registrar el nuevo socket.id para el usuario
      userSockets.set(userId, socket.id);
      console.log("Contenido de userSockets:", userSockets);
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

    socket.on("callUser", async (data) => {
      console.log("Evento callUser recibido:", data);
      const { userToCall, signal, from } = data;
      const receiverSocketId = userSockets.get(userToCall);

      if (!callRoom.has(userToCall)) {
        callRoom.set(userToCall, new Set());
      }

      callRoom.get(userToCall).add(from);

      console.log("en videollamada", callRoom);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("callUser", {
          signal,
          from,
          userToCall,
        });
      } else {
        console.error("User socket not found for user:", userToCall);
      }

      // Emitir un evento similar al usuario que realiza la llamada
      const callerSocketId = userSockets.get(from);
      io.to(callerSocketId).emit("callUser", {
        signal,
        from,
        userToCall,
      });
    });

    socket.on("answerCall", async (data) => {
      console.log("Respuesta a la llamada recibida:", data);
      const { from, signal, to } = data;
      const receiverSocketId = userSockets.get(from);
      const callerSocketId = userSockets.get(to);

      io.to(receiverSocketId).emit("callAccepted", {
        to,
        signal,
        from,
      });

      const connection = await poolBody.connect();
      try {
        const request = connection.request();

        request.input("CallerId", from);
        request.input("CallerSocketId", callerSocketId);
        request.input("CalleeId", to);
        request.input("CalleeSocketId", receiverSocketId); // Usar el socket del destinatario
        request.input("StartTime", new Date());

        await request.query(
          "INSERT INTO CallHistory (CallerId, CallerSocketId, CalleeId, CalleeSocketId, StartTime) VALUES (@CallerId, @CallerSocketId, @CalleeId, @CalleeSocketId, @StartTime);"
        );
      } catch (error) {
        console.log(error);
      } finally {
        await connection.close();
      }
    });

    /**** RESPUESTA LLAMADA**********/

    socket.on("hangupCall", async (data) => {
      console.log("llamada cancelada", data);

      const { from, to } = data;

      const receiverSocketId = userSockets.get(from);
      const callerSocketId = userSockets.get(to);

      io.to(receiverSocketId).emit("callCancelled", {
        to,
        from,
      });
      io.to(callerSocketId).emit("callCancelled", {
        to,
        from,
      });
    });
  });
};
