// users.routes.js
import { Router } from 'express';
import { getUsers, registerUser, loginUser, logout, sendRecoveryEmail, resetPassword } from '../controllers/users.controller.js';
import { CheckEmailExistRegister, hashPassword, hashNewPassword, comparePassword, verifyToken, requiredUser } from '../middlewares/user.Middleware.js';
import { validateSchema } from '../middlewares/validator.middlewares.js';
import { loginSchema } from '../schema/user.schema.js';

const router = Router();

/* GET */
router.get('/users', getUsers);


/* POST */
router.post('/register', CheckEmailExistRegister, hashPassword, registerUser);
router.post('/login',validateSchema(loginSchema) , comparePassword, loginUser);
router.post('/logout', logout);
router.post('/Recovery-password', sendRecoveryEmail);

/* PUT */
router.put('/reset-password', requiredUser, hashNewPassword, resetPassword);

export default router;
