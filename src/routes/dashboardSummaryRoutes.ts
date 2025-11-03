import express from "express";
import { getDashboardSummary } from "../controllers/dashboardSummaryController";

const router = express.Router();

// @route   GET /api/dashboard/summary
// @desc    Get complete dashboard summary
// @query   days - Number of days to look back (default: 7)
// @access  Private (add auth middleware as needed)
router.get("/summary", getDashboardSummary);

export default router;