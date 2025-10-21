import express from "express";
import { adminSignup , adminLogin ,forgotPassword,resetPassword ,updateProfile  } from "../controllers/adminController";

import { uploadImage } from "../middlewares/uploadMiddleware";
import {protectAdmin} from "../middlewares/verifyAdmin"

const router = express.Router();

router.post("/signup", adminSignup);
router.post("/login",adminLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/profile-image",protectAdmin, uploadImage, updateProfile);


export default router;
