import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel";

interface JwtPayload {
  id: string;
}

export const protectAdmin = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

      req.user = await Admin.findById(decoded.id).select("-password") || undefined;
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: "Not authorized, invalid token" });
    }
  } else {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
};
