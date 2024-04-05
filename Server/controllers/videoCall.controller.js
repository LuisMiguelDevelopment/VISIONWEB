// import { poolBody } from "../config/db.js";

// export const callFriend = async (io, socket, data) => {
//   try {
//     // Verificar que data.userToCall y data.signal no sean undefined
//     if (data.userToCall && data.signal) {
//       const connection = await poolBody.connect();
//       const request = connection.request();

//       request.input("from", data.from);
//       request.input("userToCall", data.userToCall);

//       console.log("Llamando al usuario:", data.userToCall);
      
//       // Emitir la llamada a todos los usuarios conectados
//       io.emit("callUser", {
//         userToCall: data.userToCall,
//         signal: data.signal,
//         from: data.from,
//         name: data.name,
//         to : data.to
//       });

//       await connection.close();
//     } else {
//       console.error("UserToCall or signal is undefined");
//     }
//   } catch (error) {
//     console.error("Error calling friend", error);
//   }
// };
