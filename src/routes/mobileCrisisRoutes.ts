import express from "express";
import { createMobileCrisis , getMobileCrisisSummary  } from "../controllers/mobileCrisisController";
import { protectUser } from "../middlewares/verifyUser"; 

const router = express.Router();

router.post("/create", protectUser, createMobileCrisis);
router.get("/summary",getMobileCrisisSummary)


export default router;
