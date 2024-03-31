// users.routes.js
import { Router } from 'express';
import { getUsers,  registerUser, loginUser, logout, sendRecoveryEmail, resetPassword  , getUserProfile} from '../controllers/users.controller.js';
import { CheckEmailExistRegister, hashPassword, hashNewPassword, comparePassword, verifyToken, requiredUser } from '../middlewares/user.Middleware.js';
import { validateSchema } from '../middlewares/validator.middlewares.js';
import { loginSchema } from '../schema/user.schema.js';
import { io } from '../index.js'; // Importa io


const router = Router();

/* GET */
router.get('/users', getUsers);
router.get('/profile', verifyToken, (req, res) => {
    // El middleware verifyToken ya ha verificado y decodificado el token
    // Puedes acceder a la información del usuario desde req.user
    const { Email, UserId } = req.user;
    // Aquí puedes realizar operaciones relacionadas con obtener el perfil del usuario
    res.status(200).json({ Email, UserId });
  });


/* POST */
router.post('/register', CheckEmailExistRegister, hashPassword, registerUser);
router.post('/login', validateSchema(loginSchema), comparePassword, (req, res) => loginUser(req, res, io)); // Pasa io al llamar a loginUser

router.post('/logout', logout);
router.post('/recovery-password', sendRecoveryEmail);

/* PUT */
router.put('/reset-password', hashNewPassword, resetPassword);

export default router;
