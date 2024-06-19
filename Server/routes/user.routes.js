// users.routes.js
import { Router } from 'express';
import { getUsers,  registerUser, loginUser, logout, sendRecoveryEmail, resetPassword  , getUserProfile , searchUser, updateUserProfile} from '../controllers/users.controller.js';
import { CheckEmailExistRegister, hashPassword, hashNewPassword, comparePassword, verifyToken, requiredUser } from '../middlewares/user.Middleware.js';
import { validateSchema } from '../middlewares/validator.middlewares.js';
import { loginSchema } from '../schema/user.schema.js';
import { io } from '../index.js'; // Importa io
import { upload } from '../config/config.js';

const router = Router();

/* GET */
router.get('/users', getUsers);
router.get('/profile', verifyToken , getUserProfile );
router.get('/search',verifyToken , searchUser  );


/* POST */
router.post('/register', CheckEmailExistRegister, hashPassword, registerUser);
router.post('/login', validateSchema(loginSchema), comparePassword, (req, res) => loginUser(req, res, io)); // Pasa io al llamar a loginUser

router.post('/logout', logout);
router.post('/recovery-password', sendRecoveryEmail);

/* PUT */
router.put('/reset-password', hashNewPassword, resetPassword);

router.put('/update-profile',verifyToken, upload.single('profilePicture') , updateUserProfile)

export default router;
