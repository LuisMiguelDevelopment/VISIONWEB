import { poolBody } from "../config/db.js";
import { registerSchema, loginSchema } from "../schema/user.schema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { TOKEN_SECRET } from "../config/config.js";


//Middleware to verify  if the mail is registered
export const CheckEmailExistRegister = async (req, res, next) => {
    const { Email } = req.body;
  
    try {
      const connection = await poolBody.connect();
      try {
        if (!connection.connected) {
          await connection.connect(); // Abre la conexión si no está abierta
        }
  
        const request = connection.request();
        request.input('Email', Email);
  
        const result = await request.query('SELECT * FROM Users WHERE Email = @Email');
  
        if (result.recordset.length > 0) {
          await connection.close(); 
          return res.status(409).json({ message: 'User already registered ' });
        }
  
        await connection.close(); 
        next();
      } catch (error) {
        console.log(error);
        await connection.close(); 
        return res.status(500).json({ message: 'User could not be verified' });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Error connection BD' });
    }
  };
  
  //Middleware to hash the password before storing it
  export const hashPassword = async (req, res , next)=>{
    const {PasswordKey} = req.body;

    try {
       const passwordHash = await bcrypt.hash(PasswordKey , 10)
       req.body.PasswordKey = passwordHash;
       next(); 
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Error hash password"})
    }

  }
  export const hashNewPassword = async (req, res, next) => {
    const { newPassword } = req.body;
    console.log("New password received:", newPassword); // Agregar este log

    try {
       const passwordHash = await bcrypt.hash(newPassword , 10)
       req.body.newPassword = passwordHash;
       next(); 
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Error hash password"})
    }
}

  
export const requiredUser = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
      return res.status(401).json({ message: "No token, Authorization denied" });
  }

  try {
      const decoded = jwt.verify(token, TOKEN_SECRET);
      console.log(decoded)
      req.user = decoded; // Asegúrate de que el ID de usuario está presente en el token
      
      // Actualizar la sesión del usuario en la base de datos

      next();
  } catch (error) {
      return res.status(403).json({ message: 'Invalid token' });
  }
};

// Middleware para comparar la contraseña del usuario con la almacenada en la base de datos
export const comparePassword = async (req, res, next) => {
  const { Email, PasswordKey } = req.body;
  const connection = await poolBody.connect();

  try {
      if (!connection.connected) {
          await connection.connect(); // Abre la conexión si no está abierta
      }

      const request = connection.request();
      request.input('Email', Email);

      const userExist = await request.query('SELECT * FROM Users WHERE Email = @Email');

      if (userExist.recordset.length === 0) {
          await connection.close();
          return res.status(401).json({ message: 'Invalid email or password' });
      }

      const passwordCompare = await bcrypt.compare(PasswordKey, userExist.recordset[0].PasswordKey);
      if (!passwordCompare) {
          await connection.close();
          return res.status(401).json({ message: 'Invalid email or password' });
      }

      await connection.close();
      next(); // Pasar al siguiente middleware o controlador
  } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Server error' });
  }
};



export const verifyToken = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized ran" });
  }

  try {
    jwt.verify(token, TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized ran" });
      }

      // Decodificar el token y extraer el UserId y Email
      const { Email, UserId } = decoded;

      // Adjuntar el UserId al objeto req.user
      req.user = { Email, UserId };

      // Continuar con la ejecución del siguiente middleware o controlador
      next();
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};
