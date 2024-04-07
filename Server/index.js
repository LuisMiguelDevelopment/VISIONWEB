import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { connectionDB } from "./config/db.js";
import { PORT } from "./config/config.js";
import http from "http";
import { Server } from "socket.io";

/* ROUTES */
import userRoutes from "./routes/user.routes.js";
import friendRoutes from "./routes/friends.routes.js";

/* CONTROLLER CALL */
import { userConnection } from "./controllers/userConnection.controller.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server, {
  cors: "http://localhost:3000",
  methods: ["GET", "POST"],
});

/* Mapeo de sockets a usuarios */
const userSockets = new Map(); // Creamos un mapa para almacenar los sockets asociados a los usuarios

export { io, userSockets }; // Exportamos io y userSockets para poder usarlos en otros archivos

/* use routes */
app.use("/api", userRoutes);
app.use("/api", friendRoutes);

connectionDB();

userConnection(io);

io.on("connection", (socket) => {
  socket.on("setUserId", (userId) => {
    userSockets.set(userId, socket.id);
    console.log("Contenido de userSockets:", userSockets);
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
  /******** LLAMAR AMIGO **********/
  socket.on("callUser", (data) => {
    console.log("Evento callUser recibido:", data);
    const { userToCall, signal, from } = data;
    const receiverSocketId = userSockets.get(userToCall);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callUser", {
        signal,
        from,
        userToCall
      });
    } else {
      console.error("User socket not found for user:", userToCall);
    }
  });

  
  socket.on("answerCall", (data) => {
    console.log("Respuesta a la llamada recibida:", data);
    const { from, signal, userToCall } = data;
    const receiverSocketId = userSockets.get(from);
    io.to(receiverSocketId).emit("callAccepted", { userToCall, signal, from });
  });
  
  socket.on("endCall", (data) => {
    const { from, to } = data;
    const receiverSocketId = userSockets.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callEnded", { from });
    }
  });

  /**** RESPUESTA LLAMADA**********/
});

server.listen(PORT, () => {
  console.log("Server is running on PORT: " + PORT);
});
