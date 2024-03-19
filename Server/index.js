import  express  from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import {connectionDB} from './config/db.js'
import { PORT } from './config/config.js';
import http from 'http';
import { Server } from 'socket.io';

/* ROUTES */
import userRoutes from './routes/user.routes.js'
import friendRoutes from './routes/friends.routes.js'


/* CONTROLLER CALL */

import { handleCall } from './controllers/call.controller.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server,{
    cors:"http://localhost:3000",
    methods:["GET", "POST"]
})


/* use routes */

app.use('/api' , userRoutes);
app.use('/api' , friendRoutes);

connectionDB();
handleCall(io);

app.listen(PORT, ()=>{
    console.log("Server in running in PORT: " + PORT);
})