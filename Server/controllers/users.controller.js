import { poolBody } from "../config/db.js";
import { createTokenAccess, createRandomString } from "../lib/jwt.js";
import { TOKEN_SECRET, transporter } from "../config/config.js";
import jwt from "jsonwebtoken";
export const getUsers = async (req, res) => {
  try {
    const connection = await poolBody.connect();
    const users = await connection.query("SELECT * FROM Users");
    res.status(200).send({ users });
    console.log(users.recordsets);
  } catch (error) {
    res.status(500).send({ message: "Error list users" });
  }
};

export const registerUser = async (req, res) => {
  const { NameUser, LastName, Email, PasswordKey, DateBirth } = req.body;
  try {
    const connection = await poolBody.connect();
    const request = connection.request();

    // Configurar los parámetros de entrada
    request.input("NameUser", NameUser);
    request.input("LastName", LastName);
    request.input("Email", Email);
    request.input("PasswordKey", PasswordKey);
    request.input("DateBirth", DateBirth);

    // Ejecutar la consulta SQL
    const result = await request.query(
      "INSERT INTO Users (NameUser, LastName, Email, PasswordKey , DateBirth) VALUES (@NameUser, @LastName, @Email, @PasswordKey , @DateBirth)"
    );
    console.log(result);

    const token = await createTokenAccess({ Email: Email });

    res.cookie("token", token, { httpOnly: true });

    // Cerrar la conexión
    await connection.close();

    // Enviar una respuesta exitosa
    return res.status(201).json({
      NameUser,
      LastName,
      Email,
      token,
    });
  } catch (error) {
    // Manejar errores y enviar una respuesta de error
    console.log(error);
    return res.status(500).json({ message: "Error create User" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { Email } = req.body;
    const token = await createTokenAccess({ Email });
    res.cookie("token", token, { httpOnly: true });

    return res.status(200).json({
      Email,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error login user" });
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

  let connection; // Declara la variable de conexión fuera del bloque try

  try {
    // Validate email
    if (typeof Email !== "string" || !Email.trim()) {
      throw new Error("Invalid email provided");
    }

    const token = createRandomString(32); // Assuming a secure function exists
    // Connect to database
    connection = await poolBody.connect();

    // Check user existence
    const request = connection.request();
    request.input("Email", Email);
    request.input("token", token);
    const userExists = await request.query(
      "SELECT * FROM Users WHERE Email = @Email"
    );

    if (!userExists.recordset.length) {
      // Log the attempt for security monitoring (optional)
      console.log(`Recovery email request for non-existent user: ${Email}`);
      return res.status(404).json({ message: "Email address not found" });
    }

    // Generate secure token

    // Update user record with token and expiry

    await request.query(
      "UPDATE Users SET RecoveryToken = @token, RecoveryTokenExpiry = DATEADD(HOUR, 24, GETUTCDATE()) WHERE Email = @email",
      { token, Email }
    );

    // Prepare email content (improve security practices)
    const mailOptions = {
      from: '"Your Application" <noreply@yourapp.com>', // Use a dedicated email address
      to: Email,
      subject: "Password Recovery for Your Application Account",
      html: `
        <p>Hello,</p>
        <p>You have requested to recover your password for your account associated with the email address ${Email}.</p>
        <p>To reset your password, please click on the following link within the next 24 hours:</p>
        <a href="${process.env.BASE_URL}/reset-password?token=${token}">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Sincerely,</p>
        <p>The Your Application Team</p>
      `,
    };

    // Send email with appropriate error handling
    await transporter.sendMail(mailOptions).catch((error) => {
      console.error("Error sending recovery email:", error);
      // Log the error for further investigation and potential user notification
      return res.status(500).json({ message: "Internal server error" });
    });

    console.log(`Recovery email sent to: ${Email}`);
    res.status(200).json({ message: "Recovery email sent successfully" }); // Inform user of success
  } catch (error) {
    console.error("Error processing recovery request:", error);
    res.status(500).json({ message: "Internal server error" }); // Handle unexpected errors
  } finally {
    // Gracefully close database connection (if applicable)
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

    request.input("newPassword", newPassword);
    request.input("token", token);

    const result = await request.query(
      "SELECT * FROM Users WHERE RecoveryToken = @token AND RecoveryTokenExpiry > GETUTCDATE()",
      { token }
    );

    if (result.recordset.length === 0) {
      return res.status(400).json({ message: "Invalid o expired token" });
    }

    await request.query(
      "UPDATE Users SET PasswordKey = @newPassword, RecoveryToken = NULL, RecoveryTokenExpiry = NULL WHERE RecoveryToken = @token",
      { newPassword, token }
    );

    await connection.close();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.log("Error reseting password" + error);
    return res.status(500).json({ message: "Internal server Error" });
  }
};

