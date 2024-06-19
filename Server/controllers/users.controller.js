import { poolBody } from "../config/db.js";
import { createTokenAccess, createRandomString } from "../lib/jwt.js";
import { transporter } from "../config/config.js";
import { upload } from "../config/config.js";
import { io } from "../index.js";
// Función para escapar caracteres especiales en una cadena SQL
const escapeString = (value) => {
  return value.replace(/'/g, "''");
};

export const getUsers = async (req, res) => {
  try {
    const connection = await poolBody.connect();
    const users = await connection.query("SELECT * FROM Users");
    res.status(200).send({ users });
    console.log(users.recordsets);
  } catch (error) {
    res.status(500).send({ message: "Error listing users" });
  }
};

export const searchUser = async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ message: "Missing name parameter" });
  }

  try {
    // Realiza una consulta a la base de datos para obtener los usuarios que coincidan con el nombre proporcionado
    const connection = await poolBody.connect();
    const request = connection.request();
    request.input("Name", `%${name}%`);
    const result = await request.query(
      "SELECT * FROM Users WHERE CONCAT(NameUser, ' ', LastName) LIKE @Name"
    );

    // Verifica si se encontraron usuarios que coincidan con el nombre proporcionado
    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found with the provided name" });
    }

    // Si se encuentran usuarios, devuelve los detalles en la respuesta
    const users = result.recordset;

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error searching users by name:", error);
    return res.status(500).json({ message: "Error searching users by name" });
  }
};

export const registerUser = async (req, res) => {
  const { NameUser, LastName, Email, PasswordKey, DateBirth } = req.body;
  try {
    // Verificar que los campos requeridos no sean undefined
    if (!NameUser || !LastName || !Email || !PasswordKey || !DateBirth) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const connection = await poolBody.connect();
    const request = connection.request();

    // Configurar los parámetros de entrada escapando caracteres especiales
    request.input("NameUser", escapeString(NameUser));
    request.input("LastName", escapeString(LastName));
    request.input("Email", escapeString(Email));
    request.input("PasswordKey", escapeString(PasswordKey));
    request.input("DateBirth", escapeString(DateBirth));

    // Ejecutar la consulta SQL de forma parametrizada
    const result = await request.query(
      "INSERT INTO Users (NameUser, LastName, Email, PasswordKey, DateBirth) VALUES (@NameUser, @LastName, @Email, @PasswordKey, @DateBirth); SELECT SCOPE_IDENTITY() AS UserId;"
    );

    // Obtener el UserId generado automáticamente
    const UserId = result.recordset[0].UserId;

    // Crear el token con el UserId
    const token = await createTokenAccess({ Email, UserId });

    // Establecer el token en la cookie de la respuesta
    res.cookie("token", token);

    await connection.close();

    return res.status(201).json({
      NameUser,
      LastName,
      Email,
      UserId,
      token,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Error creating user" });
  }
};

export const loginUser = async (req, res, io) => {
  try {
    const { Email } = req.body;

    // Consultar la base de datos para obtener el UserId asociado al correo electrónico
    const connection = await poolBody.connect();
    const request = connection.request();
    request.input("Email", Email);
    const result = await request.query(
      "SELECT UserId FROM Users WHERE Email = @Email"
    );

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const UserId = result.recordset[0].UserId;

    // Crear el token con el Email y UserId
    const token = await createTokenAccess({ Email, UserId });

    // Establecer el token en la cookie de la respuesta
    res.cookie("token", token);

    console.log(UserId);

    return res.status(200).json({
      Email,
      UserId,
      token,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({ message: "Error logging in user" });
  }
};

export const logout = async (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
  });
  return res.sendStatus(200);
};

export const sendRecoveryEmail = async (req, res) => {
  const { Email } = req.body;

  let connection;

  try {
    // Validar el correo electrónico
    if (typeof Email !== "string" || !Email.trim()) {
      throw new Error("Invalid email provided");
    }

    const token = createRandomString(32);

    connection = await poolBody.connect();

    const request = connection.request();
    request.input("Email", escapeString(Email));
    request.input("token", escapeString(token));
    const userExists = await request.query(
      "SELECT * FROM Users WHERE Email = @Email"
    );

    if (!userExists.recordset.length) {
      console.log(`Recovery email request for non-existent user: ${Email}`);
      return res.status(404).json({ message: "Email address not found" });
    }

    await request.query(
      "UPDATE Users SET RecoveryToken = @token, RecoveryTokenExpiry = DATEADD(HOUR, 24, GETUTCDATE()) WHERE Email = @Email",
      { Email, token }
    );

    const mailOptions = {
      from: '"Vision Web" <noreply@yourapp.com>',
      to: Email,
      subject: "Password Recovery for Your Application Account",
      html: `
        <p>Hello,</p>
        <p>You have requested to recover your password for your account associated with the email address ${Email}.</p>
        <p>To reset your password, please click on the following link within the next 24 hours:</p>
        <a href="${process.env.BASE_URL}/updatePassword?token=${token}">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Sincerely,</p>
        <p>The Your Application Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(`Recovery email sent to: ${Email}`);
    res.status(200).json({ message: "Recovery email sent successfully" });
  } catch (error) {
    console.error("Error processing recovery request:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  let connection;
  try {
    connection = await poolBody.connect();
    const request = connection.request();

    request.input("newPassword", escapeString(newPassword));
    request.input("token", escapeString(token));

    const result = await request.query(
      "SELECT * FROM Users WHERE RecoveryToken = @token AND RecoveryTokenExpiry > GETUTCDATE()",
      { token }
    );

    if (result.recordset.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    await request.query(
      "UPDATE Users SET PasswordKey = @newPassword, RecoveryToken = NULL, RecoveryTokenExpiry = NULL WHERE RecoveryToken = @token",
      { newPassword: newPassword, token: token }
    );

    await connection.close();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserProfile = async (req, res) => {
  // Extrae el ID de usuario de los parámetros de la ruta
  const UserId = req.user.UserId;

  try {
    // Realiza una consulta a la base de datos para obtener los detalles del usuario por su ID
    const connection = await poolBody.connect();
    const request = connection.request();
    request.input("UserId", UserId);
    const result = await request.query(
      "SELECT NameUser, LastName, Email, UserId, DateBirth, ProfilePicture FROM Users WHERE UserId = @UserId"
    );

    // Verifica si se encontró un usuario con el ID proporcionado
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Si se encuentra el usuario, formatea la fecha de nacimiento antes de devolverla
    const userProfile = result.recordset[0];
    userProfile.DateBirth = formatDate(userProfile.DateBirth); // Llama a la función formatDate

    // Emitir evento utilizando socket.io
    io.emit("userConnected", { UserId: UserId });

    return res.status(200).json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Error fetching user profile" });
  }
};

// Función para formatear la fecha
function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  // Ajusta el formato para asegurar que siempre tenga dos dígitos
  if (month < 10) {
    month = `0${month}`;
  }
  if (day < 10) {
    day = `0${day}`;
  }

  return `${year}-${month}-${day}`;
}




export const updateUserProfile = async (req, res) => {
  const { NameUser, LastName, Email, DateBirth } = req.body;
  const { UserId } = req.user;

  try {
    // Verificar que los campos requeridos no sean undefined
    if (!NameUser || !LastName || !Email || !DateBirth) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Manejar la subida de la imagen de perfil si se proporciona
    let profilePicturePath = null;
    if (req.file) {
      profilePicturePath = req.file.path.replace(/\\/g, '/'); // Replace backslashes with forward slashes
    }

    const connection = await poolBody.connect();
    const request = connection.request();

    // Configurar los parámetros de entrada escapando caracteres especiales
    request.input("UserId", UserId);
    request.input("NameUser", escapeString(NameUser));
    request.input("LastName", escapeString(LastName));
    request.input("Email", escapeString(Email));
    request.input("DateBirth", escapeString(DateBirth));
    if (profilePicturePath) {
      request.input("profilePicture", escapeString(profilePicturePath));
    }

    // Construir la consulta SQL
    let query = `
      UPDATE Users
      SET NameUser = @NameUser, LastName = @LastName, Email = @Email, DateBirth = @DateBirth
    `;
    if (profilePicturePath) {
      query += ", profilePicture = @profilePicture";
    }
    query += " WHERE UserId = @UserId";

    // Ejecutar la consulta SQL de forma parametrizada
    await request.query(query);

    await connection.close();

    return res.status(200).json({ message: "User profile updated successfully" });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ message: "Error updating user profile" });
  }
};
