import express, { Router } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import Connection from "./config/db_config/db.js";
import AuthRoute from "./routes/authRoutes.js";
import socketServer from "./server.js";

// Initialize dotenv
dotenv.config();

// Initialize database connection
Connection();

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;
const app = express();

// Middleware setup
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    credentials: true,
  })
);

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cookieParser());
app.use(express.json()); // This is sufficient for parsing JSON request bodies

// Define the router
const apiV1Routes = Router();

// Define routes in the router
apiV1Routes.use('/user', AuthRoute);

// Use the router with a prefix
app.use('/api/v1', apiV1Routes);

// Start the server
// socketSetup()
const server=app.listen(PORT, () => {
  console.log(`Server started on PORT ${PORT}`);
});

socketServer(server);