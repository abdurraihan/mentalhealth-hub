import { Request, Response } from "express";
import User, { IUser } from "../models/userModel";
import { sendMail } from "../utils/mailer";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken";

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


export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status === "inactive") {
      return res.status(403).json({
        message: "Your account is not active yet. Please wait for activation.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    
    const token = generateToken(user._id.toString());

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
   
    const userId = req.user; 
    
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const updates: any = {};

    if (req.file) {
      const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      updates.profileImage = imageUrl;
    }

    if (req.body.name) {
      updates.name = req.body.name;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No update data provided" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      select: "name email profileImage status", 
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};