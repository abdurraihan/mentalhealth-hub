import express from "express";
import { requestSignupOtp, verifyOtpAndSignup , loginUser , updateUserProfile } from "../controllers/userController";
import { uploadImage } from "../middlewares/uploadMiddleware";
import {protectUser} from "../middlewares/verifyUser"

const router = express.Router();

router.post("/signup/request-otp", requestSignupOtp);
router.post("/signup/verify", verifyOtpAndSignup);
router.post("/login", loginUser )
router.put("/update/profile",protectUser, uploadImage, updateUserProfile);

export default router;
