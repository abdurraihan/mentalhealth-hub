import express from "express";
import { requestSignupOtp, verifyOtpAndSignup } from "../controllers/userController";

const router = express.Router();

router.post("/signup/request-otp", requestSignupOtp);
router.post("/signup/verify", verifyOtpAndSignup);

export default router;
