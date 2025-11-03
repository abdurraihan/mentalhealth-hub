import express from "express";
import { createCrisisStabilization , getCrisisStabilizationSummary } from "../controllers/crisisStabilizationUnitController";
import { protectUser } from "../middlewares/verifyUser"; 

const router = express.Router();

router.post("/create", protectUser, createCrisisStabilization);
router.get("/summary",getCrisisStabilizationSummary)


export default router;
