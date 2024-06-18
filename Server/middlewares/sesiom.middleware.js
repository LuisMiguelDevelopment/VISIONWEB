// middleware.js
import jwt from 'jsonwebtoken';
import { poolBody } from '../config/db.js';

export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization;
   // Supongamos que el token se envía en el encabezado de autorización
   console.log('Token received:', token);

  if (!token) {
    return res.status(401).json({ message: 'Token not provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Actualizar la sesión del usuario en la base de datos
    await updateSession(decoded.UserId);

    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

async function updateSession(userId) {
  try {
    const connection = await poolBody.connect();
    const request = connection.request();
    request.input("UserId", userId);
    await request.query("UPDATE Session SET LastActive = GETDATE() WHERE UserId = @UserId");
    await connection.close();
  } catch (error) {
    console.error("Error updating user session:", error);
  }
}
