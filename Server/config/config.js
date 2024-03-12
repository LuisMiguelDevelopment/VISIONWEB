import { config } from "dotenv";

config();

export const PORT = process.env.PORT ?? 3000;
export const DB_SERVER = process.env.DB_SERVER ?? 'LUI'
export const DB_NAME  = process.env.DB_NAME ?? 'VISIONWEB'
export const DB_USER = process.env.DB_USER ?? 'VISIONWEB';
export const DB_PASSWORD = process.env.DB_PASSWORD ?? '1001470143'
export const DB_synchronize = process.env.DB_synchronize ?? true
export const DB_trustServerCertificate = process.env.DB_trustServerCertificate ?? true

