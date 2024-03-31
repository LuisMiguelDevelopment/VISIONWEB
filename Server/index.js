import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { connectionDB } from './config/db.js';
import { PORT } from './config/config.js';
import http from 'http';
import { Server } from 'socket.io';

/* ROUTES */
import userRoutes from './routes/user.routes.js';
import friendRoutes from './routes/friends.routes.js';

/* CONTROLLER CALL */
import { handleCall } from './controllers/call.controller.js';

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server, {
    cors: "http://localhost:3000",
    methods: ["GET", "POST"]
});

export { io };

/* use routes */
app.use('/api', userRoutes);
app.use('/api', friendRoutes);

connectionDB();

handleCall(io); // Aquí se llama al controlador handleCall y se pasa el objeto io

server.listen(PORT, () => {
    console.log("Server is running on PORT: " + PORT);
});
