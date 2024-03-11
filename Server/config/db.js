const mssql = require('mssql');


const config = {
    server:'LUI',
    database :'VISIONWEB',
    user : 'VISIONWEB',
    password :'1001470143',
    synchronize: true,
    trustServerCertificate: true,
};

const connectionDB = async () =>{
    try {
        await mssql.connect(config);
        console.log("DB CONNECT");
          
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

module.exports = connectionDB;