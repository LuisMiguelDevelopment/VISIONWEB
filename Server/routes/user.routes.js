import { Router } from 'express';
import { getUsers, registerUser , loginUser } from '../controllers/users.controller.js';
import { CheckEmailExistRegister , hashPassword , comparePassword} from '../middlewares/user.Middleware.js';
const router = Router();

/* GET */
router.get('/users' , getUsers);


/* POST */

router.post('/register', CheckEmailExistRegister, hashPassword , registerUser)
router.post('/login', comparePassword , loginUser)


export default router;