const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const connectionDB = require('./config/db.js');

const app = express();
const PORT =3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

connectionDB();

app.listen(PORT, ()=>{
    console.log("Server in running in PORT: " + PORT);
})