import { poolBody } from "../config/db.js";
import {createTokenAccess} from '../lib/jwt.js'

export const getUsers = async (req , res) =>{
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
    const { NameUser, LastName, Email, PasswordKey , DateBirth} = req.body;
    try {
        const connection = await poolBody.connect();
        const request = connection.request();
        
        // Configurar los parámetros de entrada
        request.input('NameUser', NameUser);
        request.input('LastName', LastName);
        request.input('Email', Email);
        request.input('PasswordKey', PasswordKey);
        request.input('DateBirth', DateBirth)
        
        // Ejecutar la consulta SQL
        const result = await request.query('INSERT INTO Users (NameUser, LastName, Email, PasswordKey , DateBirth) VALUES (@NameUser, @LastName, @Email, @PasswordKey , @DateBirth)');
        console.log(result)

        const token = await createTokenAccess({Email:Email});

        res.cookie('token', token,{httpOnly: true})

        // Cerrar la conexión
        await connection.close();

        // Enviar una respuesta exitosa
        return res.status(201).json({ 
            NameUser,
            LastName,
            Email,
            token
         });
    } catch (error) {
        // Manejar errores y enviar una respuesta de error
        console.log(error);
        return res.status(500).json({ message: 'Error create User' });
    }
};


export const loginUser = async (req, res) =>{
    try {
        const {Email} = req.body;
        const token = await createTokenAccess({Email});
        res.cookie('token', token ,{httpOnly:true})

        return res.status(200).json({
            Email,
            token
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Error login user"})
    }
}