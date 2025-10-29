import express from "express";
import { createCrisisCall , getCrisisSummary } from "../controllers/crisisCallsController";
import { protectUser } from "../middlewares/verifyUser"; 

const router = express.Router();

router.post("/create", protectUser, createCrisisCall);
router.get("/summary", getCrisisSummary);

export default router;
