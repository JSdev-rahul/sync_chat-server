import { Router } from 'express';
import FriendsController from '../controller/FriendsController.js';
// import AuthController from '../controller/AuthController.js';
// import multer from "multer";

// const upload = multer({ dest: 'uploads/' });
const FriendsRoutes = Router();

FriendsRoutes.post('/add',FriendsController.addFriend)
FriendsRoutes.get('/getFriends/:userId',FriendsController.getFriendsList)



export default FriendsRoutes;
