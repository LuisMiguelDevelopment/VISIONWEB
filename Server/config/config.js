import { config } from "dotenv";
import nodemailer  from 'nodemailer'
config();

export const PORT = process.env.PORT ?? 3000;
export const DB_SERVER = process.env.DB_SERVER ?? 'LUI'
export const DB_NAME  = process.env.DB_NAME ?? 'VISIONWEB'
export const DB_USER = process.env.DB_USER ?? 'VISIONWEB';
export const DB_PASSWORD = process.env.DB_PASSWORD ?? '1001470143'
export const DB_synchronize = process.env.DB_synchronize ?? true
export const DB_trustServerCertificate = process.env.DB_trustServerCertificate ?? true
export const TOKEN_SECRET = '1001470143VISIONWEB';

const USER_EMAIL = process.env.USER_EMAIL ?? "luismidev09@gmail.com";
const USER_PASS = process.env.USER_PASS ?? "kjoc qgzq nanz hnst";




export const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port:465,
    secure: true,
    auth:{
        user:USER_EMAIL,
        pass:USER_PASS
    }
})