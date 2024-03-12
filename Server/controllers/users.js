import { poolBody } from "../config/db.js";


export const getUser = async (req , res) =>{
    try {
        const connection = await poolBody.connect();
        const users = await connection.query('SELECT * FROM Users');
        res.status(200).send({users});  
        console.log(users.recordsets)
    } catch (error) {
        res.status(500).send({message: 'Error list users'})
    }
}


export const registerUser = async (req, res) => {
    const { NameUser, LastName, Email, PasswordKey } = req.body;
    try {
        const connection = await poolBody.connect();
        const request = connection.request();
        
        // Configurar los parámetros de entrada
        request.input('NameUser', NameUser);
        request.input('LastName', LastName);
        request.input('Email', Email);
        request.input('PasswordKey', PasswordKey);
        
        // Ejecutar la consulta SQL
        const result = await request.query('INSERT INTO Users (NameUser, LastName, Email, PasswordKey) VALUES (@NameUser, @LastName, @Email, @PasswordKey)');
        
        // Cerrar la conexión
        await connection.close();

        // Enviar una respuesta exitosa
        return res.status(201).json({ message: 'Create User OK' });
    } catch (error) {
        // Manejar errores y enviar una respuesta de error
        console.log(error);
        return res.status(500).json({ message: 'Error create User' });
    }
};