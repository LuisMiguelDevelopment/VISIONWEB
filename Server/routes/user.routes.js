// users.routes.js
import { Router } from 'express';
import { getUsers, registerUser, loginUser, logout, sendRecoveryEmail, resetPassword } from '../controllers/users.controller.js';
import { CheckEmailExistRegister, hashPassword, hashNewPassword, comparePassword, verifyToken, requiredUser } from '../middlewares/user.Middleware.js';

const router = Router();

/* GET */
router.get('/users', getUsers);
router.get('/verify', verifyToken);

/* POST */
router.post('/register', CheckEmailExistRegister, hashPassword, registerUser);
router.post('/login', comparePassword, loginUser);
router.post('/logout', logout);
router.post('/Recovery-password', sendRecoveryEmail);

/* PUT */
router.put('/reset-password', requiredUser, hashNewPassword, resetPassword);

export default router;
