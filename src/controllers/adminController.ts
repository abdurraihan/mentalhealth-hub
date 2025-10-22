import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken";
import Admin from "../models/adminModel";
import { sendMail } from "../utils/mailer";


export const adminSignup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, profileImage } = req.body;

    // Check if an admin already exists
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return res
        .status(400)
        .json({ success: false, message: "Admin already exists. Only one admin allowed." });
    }

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the admin
    const newAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      profileImage,
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully.",
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        profileImage: newAdmin.profileImage,
      },
    });
  } catch (error: any) {
    console.error("Error in admin signup:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};


export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

 
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

   
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    // Generate JWT token
    const token = generateToken(admin._id.toString());

   
    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        profileImage: admin.profileImage,
      },
    });
  } catch (error: any) {
    console.error("Error in admin login:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};


export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    admin.otp = otp;
    await admin.save();

    await sendMail(email, otp, "verify");


    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    const admin = await Admin.findOne({ email }).select("+password +otp");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (admin.otp !== otp)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    admin.otp = null;
    await admin.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};



export const updateProfile = async (req: Request, res: Response) => {
  try {
    const adminId = req.user; // coming from protectAdmin middleware
    if (!adminId) {
      return res.status(400).json({ message: "Admin ID required" });
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

    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, updates, {
      new: true,
    });

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      admin: {
        name: updatedAdmin.name,
        profileImage: updatedAdmin.profileImage,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


