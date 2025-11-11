import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  status: "active" | "inactive" ;
  otp?: string | null;
  isOtpVerified:boolean;

  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      minlength: 6,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    otp: {
      type: String,
      default: null,
      expires: 300,
    },
    profileImage: {
      type: String,
      default:
        "https://i.pravatar.cc/300?img=65",
    },
    isOtpVerified: { type: Boolean, default: false }

  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
