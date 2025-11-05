import mongoose, { Schema, Document, Model } from 'mongoose';


export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  profileImage?: string;
  otp?: string;
  isOtpVerified:boolean;
  createdAt: Date;
  updatedAt: Date;
}


const adminSchema = new Schema<IAdmin>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      default: process.env.ADMIN_EMAIL,
      immutable: true, 
      validate: {
        validator: function (v: string) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        },
        message: 'Please enter a valid email address',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, 
    },
    profileImage: {
      type: String,
      default: null,
    },
    otp: {
      type: String,
      default: null,
      expires: 300, // 5min
    },
    isOtpVerified: { type: Boolean, default: false },

  },
  {
    timestamps: true,
  }
);


const Admin: Model<IAdmin> = mongoose.model<IAdmin>('Admin', adminSchema);

export default Admin;