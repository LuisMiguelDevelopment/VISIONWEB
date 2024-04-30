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
import { callUser } from "./controllers/videoCall.controller.js";
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
  reconnection: true, 
  reconnectionAttempts: 10, 
  reconnectionDelay: 1000,
});


const userSockets = new Map(); // Creamos un mapa para almacenar los sockets asociados a los usuarios

export { io, userSockets }; // Exportamos io y userSockets para poder usarlos en otros archivos

/* use routes */
app.use("/api", userRoutes);
app.use("/api", friendRoutes);

connectionDB();

userConnection(io);
callUser(io);

server.listen(PORT, () => {
  console.log("Server is running on PORT: " + PORT);
});
