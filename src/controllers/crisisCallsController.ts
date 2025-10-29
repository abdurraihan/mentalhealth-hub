import { Request, Response } from "express";
import CrisisCall from "../models/crisisCallsModel";

export const createCrisisCall = async (req: Request, res: Response) => {
  try {
    const user = req.user; // from protectUser middleware
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized user" });
    }

    const { callByCountry, crisisType } = req.body;

    if (!callByCountry || !crisisType) {
      return res.status(400).json({
        success: false,
        message: "callByCountry and crisisType are required",
      });
    }

    const crisisCall = await CrisisCall.create({
      userId: user._id,
      callByCountry,
      crisisType,
    });

    return res.status(201).json({
      success: true,
      message: "Crisis call submitted successfully",
      data: crisisCall,
    });
  } catch (error: any) {
    console.error("Error creating crisis call:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating crisis call",
      error: error.message,
    });
  }
};



export const getCrisisSummary = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: "Please provide both year and month (e.g. ?year=2025&month=10)" });
    }

    const y = parseInt(year as string);
    const m = parseInt(month as string);

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 1);

 
    const callsByCounty = await CrisisCall.aggregate([
      { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
      { $group: { _id: "$callByCountry", totalCalls: { $sum: 1 } } },
      { $sort: { totalCalls: -1 } }
    ]);


    const callsByCrisisType = await CrisisCall.aggregate([
      { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
      { $group: { _id: "$crisisType", totalCalls: { $sum: 1 } } },
      { $sort: { totalCalls: -1 } }
    ]);

    const result = {
      month: `${y}-${m.toString().padStart(2, "0")}`,
      callsByCounty: callsByCounty.map(i => ({ county: i._id, count: i.totalCalls })),
      callsByCrisisType: callsByCrisisType.map(i => ({ crisisType: i._id, count: i.totalCalls }))
    };

    return res.status(200).json(result);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};