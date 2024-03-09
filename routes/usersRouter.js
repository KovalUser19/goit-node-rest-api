import express from "express";
import { register, login, logout } from "../controllers/usersControllers.js";
import auth from "../middleware/auth.js";

const router = express.Router();
const jsonParser = express.json();

router.post("/register", jsonParser, register);
router.post("/login", jsonParser, login);
router.get("/logout", auth, logout);

export default router;
