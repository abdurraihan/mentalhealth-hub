import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/userModel";


export const createUserByAdmin = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?._id; 
    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized admin" });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

   
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists with this email" });
    }

   
    const hashedPassword = await bcrypt.hash(password, 10);

    let profileImage = undefined;
    if (req.file) {
      profileImage = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

  
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      profileImage,
      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully by admin",
      user: newUser,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getAllUser = async (req: Request, res: Response) => {
  try {
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string; 
    const search = req.query.search as string; 
  
    const skip = (page - 1) * limit;
    
    
    const filter: any = {};
   
    if (status && status !== 'all') {
      if (status === 'active') {
        filter.status = 'active';
      } else if (status === 'inactive') {
        filter.status = 'inactive';
      }
    }

    if (search && search.trim() !== '') {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }
    
   
    const totalUsers = await User.countDocuments(filter);
    
   
    const users = await User.find(filter)
      .select(["-password", "-otp"])
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); 
    
    
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return res.status(200).json({
      success: true,
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        limit,
        hasNextPage,
        hasPrevPage
      },
      filter: {
        status: status || 'all',
        search: search || ''
      }
    });
    
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
}


export const getDashboardStats = async (req: Request, res: Response) => {
  try {
   
    const totalUsers = await User.countDocuments();
    
   
    const activeUsers = await User.countDocuments({ status: 'active' });
    

    const inactiveUsers = await User.countDocuments({ status: 'inactive' });
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today }
    });
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });
    
    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        newUsers, // Last 30 days
        newUsersToday,
        newUsersThisWeek
      },
      percentages: {
        activePercentage: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : 0,
        inactivePercentage: totalUsers > 0 ? ((inactiveUsers / totalUsers) * 100).toFixed(2) : 0
      }
    });
    
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
}

export const updateUserByAdmin = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?._id;
    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized admin" });
    }

    const { userId } = req.params;
    const { name, email, password } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if email is being changed and already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Email already exists" });
      }
    }

    // Build update object
    const updateData: any = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    // Hash password if provided
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Handle profile image upload
    if (req.file) {
      updateData.profileImage = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password -otp");

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};


export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?._id;
    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized admin" });
    }

    const { userId } = req.params;


    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid user ID format" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

   
    const newStatus = user.status === 'active' ? 'inactive' : 'active';

  
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { status: newStatus } },
      { new: true }
    ).select("-password -otp");

    return res.status(200).json({
      success: true,
      message: `User status changed to ${newStatus}`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};