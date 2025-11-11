import express from "express";
import { adminSignup , adminLogin ,sendForgotPasswordOTP,verifyForgotPasswordOTP,resetPasswordAfterOTPVerification,updateProfile,adminInfo } from "../controllers/adminController";

import { uploadImage } from "../middlewares/uploadMiddleware";
import {protectAdmin} from "../middlewares/verifyAdmin"

const router = express.Router();

router.get("/info",adminInfo)
router.post("/signup", adminSignup);
router.post("/login",adminLogin);
router.post("/verify-foget-pass-otp",verifyForgotPasswordOTP)
router.post("/forgot-password-otp", sendForgotPasswordOTP);
router.post("/reset-password", resetPasswordAfterOTPVerification);
router.put("/profile-image",protectAdmin, uploadImage, updateProfile);



export default router;
