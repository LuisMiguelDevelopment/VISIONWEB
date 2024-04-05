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
        console.log('User disconnected:', socket.id);
        userSockets.delete(socket.id);
      });

  /******** LLAMAR AMIGO **********/
  socket.on("callUser", (data) => {
    console.log("Evento callUser recibido:", data); // Agregar este registro de consola
    const { userToCall, signal, from } = data;
    
    const receiverSocketId = userSockets.get(userToCall);
    console.log(receiverSocketId)
    if (receiverSocketId) {
      // Enviar la llamada al socket del amigo correspondiente
      io.to(receiverSocketId).emit("callUser", { signal, from });
    } else {
      console.error('User socket not found for user:', userToCall);
    }
  });

  /********* RESPUESTA LLAMADA***********/
  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });

  /**** RESPUESTA LLAMADA**********/
});

server.listen(PORT, () => {
  console.log("Server is running on PORT: " + PORT);
});
