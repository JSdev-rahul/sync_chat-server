import { Router } from 'express';
import UserController from '../controller/UserController.js';


const UserRoute = Router();

UserRoute.get('/searchUser',UserController.searchUser);


export default UserRoute;
