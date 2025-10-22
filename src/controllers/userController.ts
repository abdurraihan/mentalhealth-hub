import { Request, Response } from "express";
import User, { IUser } from "../models/userModel";
import { sendMail } from "../utils/mailer";
import bcrypt from "bcryptjs";


export const requestSignupOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const tempUser = await User.create({ email, otp });
   
    await sendMail(email, otp, "verify");

    res.status(200).json({ message: "OTP sent to your email", email: tempUser.email });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};


export const verifyOtpAndSignup = async (req: Request, res: Response) => {
  const { email, otp, name, password } = req.body;
  if (!email || !otp || !name || !password)
    return res.status(400).json({ message: "Email, OTP, name and password are required" });

  try {
    const user = await User.findOne({ email, otp });
    if (!user) return res.status(400).json({ message: "Invalid OTP or email" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.name = name;
    user.password = hashedPassword;
    user.otp = undefined; 
    await user.save();

    res.status(201).json({ message: "Signup successful", user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
