import express from "express";
import {
   register,
   login,
   logout,
   current,
   uploadAvatar,
   getAvatar,
   verifyEmail,
   resendVerify,
} from "../controllers/usersControllers.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();
const jsonParser = express.json();

router.post("/register", jsonParser, register);
router.post("/login", jsonParser, login);
router.get("/logout", auth, logout);
router.get("/current", auth, current);
router.patch("/avatars", auth, upload.single("avatar"), uploadAvatar);
router.get("/avatars", auth, getAvatar);
router.get("/verify/:verificationToken", verifyEmail);
router.post("/verify", resendVerify);

export default router;
