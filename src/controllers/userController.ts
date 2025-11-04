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


// Signup controller - Creates user and sends OTP
export const signup = async (req: Request, res: Response) => {
  const { email, name, password, confirmPassword } = req.body;
  
  // Validation
  if (!email || !name || !password || !confirmPassword) {
    return res.status(400).json({ 
      message: "All fields are required" 
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ 
      message: "Passwords do not match" 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      message: "Password must be at least 6 characters long" 
    });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.status === "active") {
      return res.status(400).json({ 
        message: "User already exists with this email" 
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create or update user
    if (existingUser) {
      // Update existing inactive user
      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.otp = otp;
      await existingUser.save();
    } else {
      // Create new user
      await User.create({
        name,
        email,
        password: hashedPassword,
        otp,
        status: "inactive"
      });
    }

    // TODO: Send OTP via email
    // await sendOtpEmail(email, otp);

    res.status(201).json({ 
      message: "Signup successful. Please verify your email with the OTP sent.",
      email // Send back email for OTP verification step
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// OTP Verification controller - Verifies OTP and activates account
export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  
  if (!email || !otp) {
    return res.status(400).json({ 
      message: "Email and OTP are required" 
    });
  }

  try {
    // Find user with matching email and OTP
    const user = await User.findOne({ email, otp });
    
    if (!user) {
      return res.status(400).json({ 
        message: "Invalid OTP or email" 
      });
    }

    // Activate user account
    user.status = "active";
    user.otp = undefined; // Clear OTP after verification
    await user.save();

    // Optional: Generate JWT token here
    // const token = generateToken(user._id);

    res.status(200).json({ 
      message: "Email verified successfully. Your account is now active.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status
      }
      // token // If you're generating JWT
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Optional: Resend OTP controller
export const resendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status === "active") {
      return res.status(400).json({ 
        message: "Account is already verified" 
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();

    // TODO: Send OTP via email
    // await sendOtpEmail(email, otp);

    res.status(200).json({ 
      message: "OTP resent successfully" 
    });
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