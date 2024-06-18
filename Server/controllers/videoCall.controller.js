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
      const { userToCall, signal, from, name, nameCall } = data;
      const receiverSocketId = userSockets.get(userToCall);
    
      let connection;
      try {
        // Abrir una conexión a la base de datos
        connection = await poolBody.connect();
        console.log("Conexión establecida con la base de datos");
    
        // Verificar si el usuario que se va a llamar ya está en una llamada activa
        const queryCheckActiveCall = `
          SELECT TOP 1 CH.CallId
          FROM CallHistory CH
          INNER JOIN CallParticipants CP ON CH.CallId = CP.CallId
          WHERE CP.UserId = @UserId
            AND CP.IsActiveParticipant = 1
            AND CH.EndDateTime IS NULL;  -- La llamada aún no ha finalizado
        `;
    
        const resultCheckActiveCall = await connection
          .request()
          .input("UserId", userToCall)
          .query(queryCheckActiveCall);
    
        if (resultCheckActiveCall.recordset.length > 0) {
          // Usuario en llamada activa, enviar mensaje al frontend
          console.log(`El usuario ${userToCall} ya está en una llamada activa`);
    
          // Emitir mensaje al frontend del usuario que intenta llamar
          const callerSocketId = userSockets.get(from);
          io.to(callerSocketId).emit("callFailed", {
            reason: `El usuario ${userToCall} ya está en una llamada activa`,
          });
    
          return; // Terminar la ejecución del evento
        }
    
        // Si el usuario no está en una llamada activa, proceder a registrar la llamada en la base de datos
        const queryCallHistory = `
          INSERT INTO CallHistory (StartDateTime)
          OUTPUT inserted.CallId
          VALUES (GETDATE());
        `;
    
        const resultCallHistory = await connection
          .request()
          .query(queryCallHistory);
    
        const callId = resultCallHistory.recordset[0].CallId;
    
        // Registrar participantes en la llamada en CallParticipants
        const queryCallParticipants = `
          INSERT INTO CallParticipants (CallId, UserId, IsActiveParticipant)
          VALUES (@CallId, @UserId, @IsActiveParticipant);
        `;
    
        // Registrar al usuario que llama
        await connection
          .request()
          .input("CallId", callId)
          .input("UserId", from)
          .input("IsActiveParticipant", 1) // Activo
          .query(queryCallParticipants);
    
        // Registrar al usuario que es llamado
        await connection
          .request()
          .input("CallId", callId)
          .input("UserId", userToCall)
          .input("IsActiveParticipant", 1) // Activo
          .query(queryCallParticipants);
    
        console.log("Llamada registrada en la base de datos");
    
        // Notificar al receptor de la llamada si está conectado
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("callUser", {
            signal,
            from,
            userToCall,
            name
          });
        } else {
          console.error("Socket no encontrado para el usuario:", userToCall);
        }
    
        // Notificar al llamante sobre el inicio de la llamada
        const callerSocketId = userSockets.get(from);
        io.to(callerSocketId).emit("callUser", {
          signal,
          from,
          userToCall,
          nameCall
        });
    
      } catch (error) {
        console.error("Error durante la llamada:", error.message);
      } finally {
        // Cerrar la conexión a la base de datos al finalizar
        if (connection) {
          try {
            await connection.close();
            console.log("Conexión cerrada correctamente");
          } catch (error) {
            console.error("Error al cerrar la conexión:", error.message);
          }
        }
      }
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
      console.log("Llamada cancelada:", data);
    
      const { from, to } = data;
      const callerSocketId = userSockets.get(from);
      const receiverSocketId = userSockets.get(to);
    
      // Emitir evento de llamada cancelada a ambos participantes
      io.to(receiverSocketId).emit("callCancelled", { to, from });
      io.to(callerSocketId).emit("callCancelled", { to, from });
    
      let connection;
      try {
        // Abrir una conexión a la base de datos
        connection = await poolBody.connect();
        console.log("Conexión establecida con la base de datos");
    
        // Buscar la llamada en la base de datos por IDs de participantes
        const queryFindCall = `
          SELECT CallId
          FROM CallParticipants
          WHERE (UserId = @UserId1 AND IsActiveParticipant = 1)
            OR (UserId = @UserId2 AND IsActiveParticipant = 1);
        `;
    
        const resultFindCall = await connection
          .request()
          .input("UserId1", from)
          .input("UserId2", to)
          .query(queryFindCall);
    
        if (resultFindCall.recordset.length > 0) {
          const callId = resultFindCall.recordset[0].CallId;
    
          // Eliminar la entrada de CallParticipants
          const queryDeleteParticipants = `
            DELETE FROM CallParticipants
            WHERE CallId = @CallId;
          `;
    
          await connection
            .request()
            .input("CallId", callId)
            .query(queryDeleteParticipants);
    
          // Eliminar la entrada de CallHistory
          const queryDeleteCallHistory = `
            DELETE FROM CallHistory
            WHERE CallId = @CallId;
          `;
    
          await connection
            .request()
            .input("CallId", callId)
            .query(queryDeleteCallHistory);
    
          console.log("Llamada eliminada de la base de datos");
        } else {
          console.log("No se encontró la llamada en la base de datos");
        }
    
      } catch (error) {
        console.error("Error al eliminar la llamada de la base de datos:", error.message);
      } finally {
        // Cerrar la conexión a la base de datos al finalizar
        if (connection) {
          try {
            await connection.close();
            console.log("Conexión cerrada correctamente");
          } catch (error) {
            console.error("Error al cerrar la conexión:", error.message);
          }
        }
      }
    });
  });
};
