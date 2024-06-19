import { config } from "dotenv";
import nodemailer  from 'nodemailer'
import multer from 'multer'


config();

export const PORT = process.env.PORT; 
export const DB_SERVER = process.env.DB_SERVER; 
export const DB_NAME  = process.env.DB_NAME; 
export const DB_USER = process.env.DB_USER; 
export const DB_PASSWORD = process.env.DB_PASSWORD; 
export const DB_synchronize = process.env.DB_synchronize ?? true;
export const DB_trustServerCertificate = process.env.DB_trustServerCertificate ?? true; 
export const TOKEN_SECRET = process.env.TOKEN_SECRET;
export const BASE_URL = process.env.BASE_URL;

const USER_EMAIL = process.env.USER_EMAIL ;
const USER_PASS = process.env.USER_PASS ;




export const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port:465,
    secure: true,
    auth:{
        user:USER_EMAIL,
        pass:USER_PASS
    }
})


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

export const upload = multer({ storage: storage });