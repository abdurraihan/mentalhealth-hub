import { Request, Response } from "express";
import CrisisCall from "../models/crisisCallsModel";
import MobileCrisis from "../models/mobileCrisisModel";
import CrisisStabilization from "../models/crisisStabilizationUnitModel";

// 🧠 Helper: Get last 7-day submission stats for a user
async function getUserWeeklySubmissions(userId: string) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const weeklyData = await Promise.all(
    last7Days.map(async (date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const [crisisCallCount, mobileCrisisCount, stabilizationCount] =
        await Promise.all([
          CrisisCall.countDocuments({
            userId,
            createdAt: { $gte: date, $lt: nextDay },
          }),
          MobileCrisis.countDocuments({
            userId,
            createdAt: { $gte: date, $lt: nextDay },
          }),
          CrisisStabilization.countDocuments({
            userId,
            createdAt: { $gte: date, $lt: nextDay },
          }),
        ]);

      return {
        day: days[date.getDay()],
        date: date.toISOString().split("T")[0],
        total: crisisCallCount + mobileCrisisCount + stabilizationCount,
      };
    })
  );

  return weeklyData;
}

// 🎯 Main Controller
export const getUserSummary = async (req: Request, res: Response) => {
  try {
    const user = req.user; // from your authentication middleware
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized user" });
    }

    const userId = user._id || user.id;

    // Total submissions per form type
    const [crisisCalls, mobileCrisis, stabilization] = await Promise.all([
      CrisisCall.countDocuments({ userId }),
      MobileCrisis.countDocuments({ userId }),
      CrisisStabilization.countDocuments({ userId }),
    ]);

    const totalForms = crisisCalls + mobileCrisis + stabilization;

    // Last submitted form
    const lastSubmission = await Promise.any([
      CrisisCall.findOne({ userId }).sort({ createdAt: -1 }),
      MobileCrisis.findOne({ userId }).sort({ createdAt: -1 }),
      CrisisStabilization.findOne({ userId }).sort({ createdAt: -1 }),
    ]).catch(() => null);

    const lastSubmittedAt = lastSubmission ? lastSubmission.createdAt : null;

    // Weekly insights
    const weeklyInsights = await getUserWeeklySubmissions(userId);

    res.status(200).json({
      success: true,
      data: {
        userId,
        totalFormsSubmitted: totalForms,
        lastSubmittedAt,
        formBreakdown: {
          crisisCalls,
          mobileCrisis,
          crisisStabilization: stabilization,
        },
        weeklyInsights,
      },
    });
  } catch (error) {
    console.error("User summary error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user summary",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
