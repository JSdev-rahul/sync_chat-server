import { Router } from 'express';
import AuthController from '../controller/AuthController.js';
import multer from "multer";

const upload = multer({ dest: 'uploads/' });
const AuthRoute = Router();

AuthRoute.post('/signup', AuthController.signUp);
AuthRoute.post('/login', AuthController.logIn);
AuthRoute.post('/profile', upload.single('avatar'), AuthController.setUserProfile);

export default AuthRoute;
