import { poolBody } from "../config/db.js";
import { verifyToken } from "../middlewares/user.Middleware.js";

export const handleCall = (io) => {
  // Objeto para almacenar los usuarios conectados
  const connectedUsers = {};

  // Función para obtener los usuarios conectados desde la base de datos
  async function fetchConnectedUsers() {
    try {
      const connection = await poolBody.connect();
      const request = connection.request();
      const result = await request.query("SELECT UserId FROM ConnectedUsers");
      await connection.close();
      // Almacena los usuarios conectados en el objeto connectedUsers
      result.recordset.forEach((row) => {
        connectedUsers[row.UserId] = true;
      });
    } catch (error) {
      console.error("Error fetching connected users: ", error);
    }
  }

  // Llama a la función fetchConnectedUsers para obtener los usuarios conectados al inicio
  fetchConnectedUsers();

  // Manejo de eventos cuando un cliente se conecta al servidor de sockets
  io.on("connection", async (socket) => {
    const UserId = socket.request._query.UserId;
    console.log("UserId:", UserId);

    try {
      // Conexión a la base de datos para insertar/actualizar el usuario conectado
      const connection = await poolBody.connect();
      const request = connection.request();
      request.input("UserId", UserId);
      // Query SQL para insertar/actualizar el usuario conectado en la tabla ConnectedUsers
      await request.query("MERGE INTO ConnectedUsers USING (VALUES (@UserId)) AS source (UserId) ON ConnectedUsers.UserId = source.UserId WHEN NOT MATCHED THEN INSERT (UserId) VALUES (source.UserId);");
      await connection.close();

      // Agrega al usuario conectado al objeto connectedUsers
      connectedUsers[UserId] = true;
      // Emite la lista de usuarios conectados a todos los clientes
      emitConnectedUsers();
    } catch (error) {
      console.error("Error inserting/updating connected user into database: ", error);
    }

    // Manejo de evento cuando un cliente se desconecta
    socket.on("disconnect", async () => {
      console.log("Cliente desconectado");
      try {
        // Conexión a la base de datos para eliminar al usuario desconectado
        const connection = await poolBody.connect();
        const request = connection.request();
        request.input("UserId", UserId);
        // Query SQL para eliminar al usuario desconectado de la tabla ConnectedUsers
        await request.query("DELETE FROM ConnectedUsers WHERE UserId = @UserId");
        await connection.close();

        // Elimina al usuario desconectado del objeto connectedUsers
        delete connectedUsers[UserId];
        // Emite la lista de usuarios conectados a todos los clientes
        emitConnectedUsers();
      } catch (error) {
        console.error("Error deleting connected user from database: ", error);
      }
    });

    // Manejo de evento cuando un usuario vuelve a iniciar sesión
    socket.on("userLoggedIn", async () => {
      console.log("El usuario ha iniciado sesión nuevamente");
      try {
        // Conexión a la base de datos para insertar al usuario que ha iniciado sesión nuevamente
        const connection = await poolBody.connect();
        const request = connection.request();
        request.input("UserId", UserId);
        // Query SQL para insertar al usuario que ha iniciado sesión nuevamente en la tabla ConnectedUsers
        await request.query("MERGE INTO ConnectedUsers USING (VALUES (@UserId)) AS source (UserId) ON ConnectedUsers.UserId = source.UserId WHEN NOT MATCHED THEN INSERT (UserId) VALUES (source.UserId);");
        await connection.close();
        console.log("Sesión guardada en la base de datos");
      } catch (error) {
        console.error("Error saving user session to database: ", error);
      }
    });
  });

  // Manejo de evento cuando un cliente se reconecta al servidor de sockets
  
  // Función para emitir la lista de usuarios conectados a todos los clientes
  async function emitConnectedUsers() {
    console.log("Connected users:", Object.keys(connectedUsers));
    io.emit("connectedUsers", Object.keys(connectedUsers));
  }

  // Otras funciones y lógica de tu aplicación, como checkFriendship y createCallHistory
};
