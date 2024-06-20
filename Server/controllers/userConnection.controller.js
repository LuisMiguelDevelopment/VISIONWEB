import { poolBody } from "../config/db.js";

export const connectedUsers = {};

const userSocketMap = new Map();

export const userConnection = (io) => {
  // Object to store connected users

  // Function to fetch connected users from the database
  async function fetchConnectedUsers() {
    try {
      const connection = await poolBody.connect();
      const request = connection.request();
      const result = await request.query("SELECT UserId FROM ConnectedUsers");
      await connection.close();
      // Store connected users in the connectedUsers object
      result.recordset.forEach((row) => {
        connectedUsers[row.UserId] = true;
      });
    } catch (error) {
      console.error("Error fetching connected users: ", error);
    }
  }

  // Call fetchConnectedUsers function to get connected users on startup
  fetchConnectedUsers();

  // Handling events when a client connects to the socket server
  io.on("connection", async (socket) => {
    const { userId } = socket.request._query; // Correct parameter name to 'userId'
    console.log("UserId:", userId);

    userSocketMap.set(userId, socket);

    try {
      // Database connection to insert/update the connected user
      const connection = await poolBody.connect();
      const request = connection.request();
      request.input("UserId", userId); // Correct parameter name to 'userId'
      // SQL query to insert/update the connected user in the ConnectedUsers table
      await request.query(
        "MERGE INTO ConnectedUsers USING (VALUES (@UserId)) AS source (UserId) ON ConnectedUsers.UserId = source.UserId WHEN NOT MATCHED THEN INSERT (UserId) VALUES (source.UserId);"
      );
      await connection.close();

      // Add the connected user to the connectedUsers object
      connectedUsers[userId] = true;
      // Emit the list of connected users to all clients
      emitConnectedUsers();
    } catch (error) {
      console.error(
        "Error inserting/updating connected user into database: ",
        error
      );
    }

    // Handling event when a client disconnects
    socket.on("disconnect", async () => {
      console.log("Client disconnected");
      try {
        // Database connection to delete the disconnected user
        const connection = await poolBody.connect();
        const request = connection.request();
        request.input("UserId", userId); // Correct parameter name to 'userId'
        // SQL query to delete the disconnected user from the ConnectedUsers table
        await request.query(
          "DELETE FROM ConnectedUsers WHERE UserId = @UserId"
        );
        await connection.close();

        // Remove the disconnected user from the connectedUsers object
        delete connectedUsers[userId];

        userSocketMap.delete(userId);
        // Emit the list of connected users to all clients
        emitConnectedUsers();
      } catch (error) {
        console.error("Error deleting connected user from database: ", error);
      }
    });

    // Handling event when a user logs in again
    socket.on("userLoggedIn", async () => {
      console.log("User has logged in again");
      try {
        // Database connection to insert the user who logged in again
        const connection = await poolBody.connect();
        const request = connection.request();
        request.input("UserId", userId); // Correct parameter name to 'userId'
        // SQL query to insert the user who logged in again into the ConnectedUsers table
        await request.query(
          "MERGE INTO ConnectedUsers USING (VALUES (@UserId)) AS source (UserId) ON ConnectedUsers.UserId = source.UserId WHEN NOT MATCHED THEN INSERT (UserId) VALUES (source.UserId);"
        );
        await connection.close();
        console.log("Session saved in the database");

        userSocketMap.set(userId, socket);

        // Call fetchConnectedUsers after a user logs in again
        fetchConnectedUsers();
      } catch (error) {
        console.error("Error saving user session to database: ", error);
      }
    });

  });

  // Function to emit the list of connected users to all clients
  async function emitConnectedUsers() {
    const connectedUserIds = Array.from(userSocketMap.keys());
    console.log("Connected users:", Object.keys(connectedUserIds));
    io.emit("connectedUsers", connectedUserIds); // Emit connectedUserIds directly without Object.keys
  }
};
