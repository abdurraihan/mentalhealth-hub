import { Request, Response } from "express";
import User from "../models/userModel";
import CrisisCall from "../models/crisisCallsModel";
import MobileCrisis from "../models/mobileCrisisModel";
import CrisisStabilization from "../models/crisisStabilizationUnitModel";

// Helper function to get weekly submissions with comparison
async function getWeeklySubmissionsWithComparison() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Current week (last 7 days)
  const currentWeekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  // Previous week (7-14 days ago)
  const previousWeekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  // Get current week data
  const currentWeekData = await Promise.all(
    currentWeekDays.map(async (date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const [crisisCallCount, mobileCrisisCount, stabilizationCount] =
        await Promise.all([
          CrisisCall.countDocuments({
            createdAt: { $gte: date, $lt: nextDay },
          }),
          MobileCrisis.countDocuments({
            createdAt: { $gte: date, $lt: nextDay },
          }),
          CrisisStabilization.countDocuments({
            createdAt: { $gte: date, $lt: nextDay },
          }),
        ]);

      const totalCount = crisisCallCount + mobileCrisisCount + stabilizationCount;

      return {
        day: days[date.getDay()],
        date: date.toISOString().split('T')[0],
        count: totalCount,
        crisisCalls: crisisCallCount,
        mobileCrisis: mobileCrisisCount,
        stabilization: stabilizationCount,
      };
    })
  );

  // Get previous week data
  const previousWeekData = await Promise.all(
    previousWeekDays.map(async (date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const [crisisCallCount, mobileCrisisCount, stabilizationCount] =
        await Promise.all([
          CrisisCall.countDocuments({
            createdAt: { $gte: date, $lt: nextDay },
          }),
          MobileCrisis.countDocuments({
            createdAt: { $gte: date, $lt: nextDay },
          }),
          CrisisStabilization.countDocuments({
            createdAt: { $gte: date, $lt: nextDay },
          }),
        ]);

      return crisisCallCount + mobileCrisisCount + stabilizationCount;
    })
  );

  // Calculate totals
  const currentWeekTotal = currentWeekData.reduce((sum, item) => sum + item.count, 0);
  const previousWeekTotal = previousWeekData.reduce((sum, count) => sum + count, 0);

  // Calculate percentage change
  const percentageChange = previousWeekTotal > 0
    ? ((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100
    : 0;

  return {
    currentWeek: currentWeekData,
    currentWeekTotal,
    previousWeekTotal,
    percentageChange: parseFloat(percentageChange.toFixed(2)),
  };
}

// Helper function to get new users with details
async function getNewUsersData(daysAgo: Date) {
  const newUsers = await User.find(
    { createdAt: { $gte: daysAgo } },
    { name: 1, email: 1, status: 1, profileImage: 1, createdAt: 1 }
  )
    .sort({ createdAt: -1 })
    .limit(10);

  const newUsersCount = await User.countDocuments({ createdAt: { $gte: daysAgo } });

  // Group new users by day
  const newUsersByDay = await User.aggregate([
    { $match: { createdAt: { $gte: daysAgo } } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return {
    totalNewUsers: newUsersCount,
    recentUsers: newUsers,
    newUsersByDay,
  };
}

// Single dashboard summary controller
export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const { days = "7" } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days as string));

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      crisisCallsCount,
      mobileCrisisCount,
      crisisStabilizationCount,
      weeklySubmissions,
      newUsersData,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: "active" }),
      User.countDocuments({ status: "inactive" }),
      CrisisCall.countDocuments({ createdAt: { $gte: daysAgo } }),
      MobileCrisis.countDocuments({ createdAt: { $gte: daysAgo } }),
      CrisisStabilization.countDocuments({ createdAt: { $gte: daysAgo } }),
      getWeeklySubmissionsWithComparison(),
      getNewUsersData(daysAgo),
    ]);

    const totalFormSubmitted =
      crisisCallsCount + mobileCrisisCount + crisisStabilizationCount;

    // Calculate user growth from previous period
    const previousPeriodEnd = new Date();
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - parseInt(days as string));
    const previousPeriodStart = new Date(previousPeriodEnd);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - parseInt(days as string));

    const previousPeriodUsers = await User.countDocuments({
      createdAt: { $lt: previousPeriodEnd },
    });

    const userGrowth =
      previousPeriodUsers > 0
        ? ((totalUsers - previousPeriodUsers) / previousPeriodUsers) * 100
        : 0;

    res.status(200).json({
      success: true,
      data: {
        // Form submission metrics
        totalFormSubmitted,
        crisisCalls: crisisCallsCount,
        mobileCrisis: mobileCrisisCount,
        crisisStabilization: crisisStabilizationCount,

        // User metrics
        totalUsers,
        activeUsers,
        inactiveUsers,
        userGrowth: parseFloat(userGrowth.toFixed(2)),

        // New users detailed data
        newUsers: {
          count: newUsersData.totalNewUsers,
          recentUsers: newUsersData.recentUsers,
          dailyBreakdown: newUsersData.newUsersByDay,
        },

        // Weekly submissions with comparison
        weeklySubmissions: {
          currentWeek: weeklySubmissions.currentWeek,
          comparison: {
            currentWeekTotal: weeklySubmissions.currentWeekTotal,
            previousWeekTotal: weeklySubmissions.previousWeekTotal,
            percentageChange: weeklySubmissions.percentageChange,
          },
        },
      },
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard summary",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};