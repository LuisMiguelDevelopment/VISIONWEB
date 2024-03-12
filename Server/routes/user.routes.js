import { Router } from 'express';
import { getUser, registerUser } from '../controllers/users.js';

const router = Router();

/* GET */
router.get('/users' , getUser);


/* POST */

router.post('/users' , registerUser)


export default router;