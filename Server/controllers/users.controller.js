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
  const userId = req.user.UserId;

  if (!name) {
    return res.status(400).json({ message: "Missing name parameter" });
  }
  if (!userId) {
    return res.status(400).json({ message: "Missing userId parameter" });
  }

  try {
    const connection = await poolBody.connect();
    const request = connection.request();
    request.input("Name", `%${name}%`);
    request.input("UserId", userId);

    const result = await request.query(`
      SELECT * 
      FROM Users 
      WHERE CONCAT(NameUser, ' ', LastName) LIKE @Name
      AND UserId != @UserId  -- Exclude the current user
      AND UserId NOT IN (
        SELECT 
          CASE 
            WHEN UserId1 = @UserId THEN UserId2
            ELSE UserId1
          END
        FROM FriendsList
        WHERE (UserId1 = @UserId OR UserId2 = @UserId)
      )
    `);

    await connection.close();

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No users found with the provided name" });
    }

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
    
    if (!NameUser || !LastName || !Email || !PasswordKey || !DateBirth) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const connection = await poolBody.connect();
    const request = connection.request();

    
    request.input("NameUser", escapeString(NameUser));
    request.input("LastName", escapeString(LastName));
    request.input("Email", escapeString(Email));
    request.input("PasswordKey", escapeString(PasswordKey));
    request.input("DateBirth", escapeString(DateBirth));

    // Ejecutar la consulta SQL de forma parametrizada
    const result = await request.query(
      "INSERT INTO Users (NameUser, LastName, Email, PasswordKey, DateBirth) VALUES (@NameUser, @LastName, @Email, @PasswordKey, @DateBirth); SELECT SCOPE_IDENTITY() AS UserId;"
    );

    const UserId = result.recordset[0].UserId;

    const token = await createTokenAccess({ Email, UserId });
  
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

    const token = await createTokenAccess({ Email, UserId });

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
 
  const UserId = req.user.UserId;

  try {
   
    const connection = await poolBody.connect();
    const request = connection.request();
    request.input("UserId", UserId);
    const result = await request.query(
      "SELECT NameUser, LastName, Email, UserId, DateBirth, ProfilePicture FROM Users WHERE UserId = @UserId"
    );

    
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

   
    const userProfile = result.recordset[0];
    userProfile.DateBirth = formatDate(userProfile.DateBirth); 

    
    io.emit("userConnected", { UserId: UserId });

    return res.status(200).json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Error fetching user profile" });
  }
};


function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  
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
    
    if (!NameUser || !LastName || !Email || !DateBirth) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    
    let profilePicturePath = null;
    if (req.file) {
      profilePicturePath = req.file.path.replace(/\\/g, "/");
    }

    const connection = await poolBody.connect();
    const request = connection.request();

    
    request.input("UserId", UserId);
    request.input("NameUser", escapeString(NameUser));
    request.input("LastName", escapeString(LastName));
    request.input("Email", escapeString(Email));
    request.input("DateBirth", escapeString(DateBirth));
    if (profilePicturePath) {
      request.input("profilePicture", escapeString(profilePicturePath));
    }

    
    let query = `
      UPDATE Users
      SET NameUser = @NameUser, LastName = @LastName, Email = @Email, DateBirth = @DateBirth
    `;
    if (profilePicturePath) {
      query += ", profilePicture = @profilePicture";
    }
    query += " WHERE UserId = @UserId";

    
    await request.query(query);

    await connection.close();

    return res
      .status(200)
      .json({ message: "User profile updated successfully" });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ message: "Error updating user profile" });
  }
};
