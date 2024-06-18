import {Router} from 'express';

import { getFriendRequest, sendFriendRequest  , acceptFriendRequest, ListFriends, deleteFriend, deleteRequestFriend} from '../controllers/friends.controller.js';
import { requiredUser , verifyToken } from '../middlewares/user.Middleware.js';
const router = Router();

/* GET */
router.get('/friends-request' , verifyToken, requiredUser, getFriendRequest);
router.get('/List-friends' , verifyToken, requiredUser, ListFriends);

/* POST  */
router.post('/friends/add-friends', verifyToken,requiredUser , sendFriendRequest);

/* PUT */

router.put('/friends/accept-request/:requestId', verifyToken , requiredUser , acceptFriendRequest);


/* DELETE */

router.delete('/friends/delete-request/:requestId' , verifyToken , requiredUser , deleteRequestFriend)
router.delete('/friends/delete-friend/:friendId' , verifyToken , requiredUser , deleteFriend)


export default router;