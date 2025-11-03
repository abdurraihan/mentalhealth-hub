import express from "express";
import { getUserSummary } from "../controllers/userSummaryController";
import { protectUser } from "../middlewares/verifyUser"; // must attach req.user

const router = express.Router();

router.get("/summary", protectUser, getUserSummary);

export default router;
