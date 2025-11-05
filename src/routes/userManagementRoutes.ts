import express from "express";
import { createUserByAdmin ,getAllUser , getDashboardStats ,updateUserByAdmin ,toggleUserStatus,deleteUserByAdmin   } from "../controllers/userManagementController";
import { protectAdmin } from "../middlewares/verifyAdmin";
import { uploadImage } from "../middlewares/uploadMiddleware";

const router = express.Router();

router.post("/create-user", protectAdmin, uploadImage, createUserByAdmin);
router.put("/update-user/:userId",protectAdmin,uploadImage,updateUserByAdmin)
router.patch("/change-status/:userId", protectAdmin, toggleUserStatus)
router.get("/all-user",getAllUser)
router.get("/dashboard/stats", getDashboardStats)
router.delete("/delete/:userId",protectAdmin,deleteUserByAdmin)

export default router;
