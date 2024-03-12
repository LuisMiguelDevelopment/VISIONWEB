import mssql from "mssql";

import {
  DB_SERVER,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_synchronize,
  DB_trustServerCertificate,
} from "./config.js";

const config = {
  server: DB_SERVER,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  options: {
    synchronize: DB_synchronize,
    trustServerCertificate: DB_trustServerCertificate
  }
 
};

export const poolBody = new mssql.ConnectionPool(config);

export const connectionDB = async () => {
  try {
    await mssql.connect(config);
    console.log("DB CONNECT");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
