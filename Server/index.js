import  express  from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import {connectionDB} from './config/db.js'
import { PORT } from './config/config.js';

/* ROUTES */
import userRoutes from './routes/user.routes.js'


const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

/* use routes */

app.use('/api' , userRoutes);

connectionDB();

app.listen(PORT, ()=>{
    console.log("Server in running in PORT: " + PORT);
})