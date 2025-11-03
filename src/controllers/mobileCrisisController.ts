import { Request, Response } from "express";
import MobileCrisis from "../models/mobileCrisisModel";

export const createMobileCrisis = async (req: Request, res: Response) => {
  try {
    const user = req.user; // from protectUser middleware
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const {
      referralSource,
      totalDispatches,
      dispatchCounty,
      crisisType,
      outcome,
      totalResponseTime,
      meanResponseTime,
      totalOnSceneTime,
      meanOnSceneTime,
      referralsGiven,
      referralType,
      naloxoneDispensations,
      followUpContacts,
      individualsServed,
      primaryInsurance,
      ageGroup,
      veteranStatus,
      servingInMilitary,
    } = req.body;

    const crisisRecord = await MobileCrisis.create({
      userId: user._id,
      referralSource,
      totalDispatches,
      dispatchCounty,
      crisisType,
      outcome,
      totalResponseTime,
      meanResponseTime,
      totalOnSceneTime,
      meanOnSceneTime,
      referralsGiven,
      referralType,
      naloxoneDispensations,
      followUpContacts,
      individualsServed,
      primaryInsurance,
      ageGroup,
      veteranStatus,
      servingInMilitary,
    });

    return res.status(201).json({
      success: true,
      message: "Mobile crisis record created successfully",
      data: crisisRecord,
    });
  } catch (error: any) {
    console.error("Error creating mobile crisis record:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating mobile crisis record",
      error: error.message,
    });
  }
};



export const getMobileCrisisSummary = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ 
        message: "Please provide both year and month (e.g. ?year=2025&month=10)" 
      });
    }

    const y = parseInt(year as string);
    const m = parseInt(month as string);

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 1);

    const dateFilter = { createdAt: { $gte: startDate, $lt: endDate } };

    // 1. Referrals to Mobile Crisis (Count by Referral Source)
    const referralsBySource = await MobileCrisis.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$referralSource", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 2. Total Number of Mobile Crisis Dispatches
    const totalDispatches = await MobileCrisis.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: "$totalDispatches" } } }
    ]);

    // 3. Mobile Crisis Dispatches by County
    const dispatchesByCounty = await MobileCrisis.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$dispatchCounty", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 4. Mobile Crisis Dispatches by Crisis Type
    const dispatchesByCrisisType = await MobileCrisis.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$crisisType", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 5. Outcome of Mobile Crisis Engagement
    const outcomesByType = await MobileCrisis.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$outcome", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 6. Total Response Time (convert minutes to hours)
    const responseTime = await MobileCrisis.aggregate([
      { $match: dateFilter },
      { 
        $group: { 
          _id: null, 
          totalMinutes: { $sum: "$totalResponseTime" },
          totalRecords: { $sum: 1 }
        } 
      }
    ]);

    // 7. Mean Response Time
    const meanResponseTime = await MobileCrisis.aggregate([
      { $match: dateFilter },
      { 
        $group: { 
          _id: null, 
          avgMinutes: { $avg: "$meanResponseTime" }
        } 
      }
    ]);

    // 8. Total On-Scene Time (convert minutes to hours)
    const onSceneTime = await MobileCrisis.aggregate([
      { $match: dateFilter },
      { 
        $group: { 
          _id: null, 
          totalMinutes: { $sum: "$totalOnSceneTime" },
          totalRecords: { $sum: 1 }
        } 
      }
    ]);

    // 9. Mean On-Scene Time
    const meanOnSceneTime = await MobileCrisis.aggregate([
      { $match: dateFilter },
      { 
        $group: { 
          _id: null, 
          avgMinutes: { $sum: "$meanOnSceneTime" }
        } 
      }
    ]);

    // 10. Total Referrals Given
    const totalReferrals = await MobileCrisis.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: "$referralsGiven" } } }
    ]);

    // 11. Referrals by Type
    const referralsByType = await MobileCrisis.aggregate([
      { $match: { ...dateFilter, referralType: { $exists: true, $ne: null } } },
      { $group: { _id: "$referralType", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 12. Total Naloxone Dispensations
    const totalNaloxone = await MobileCrisis.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: "$naloxoneDispensations" } } }
    ]);

    // 13. Total Follow-Up Contacts
    const totalFollowUps = await MobileCrisis.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: "$followUpContacts" } } }
    ]);

    // 14. Total Individuals Served
    const totalIndividuals = await MobileCrisis.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: "$individualsServed" } } }
    ]);

    // 15. Primary Insurance Distribution
    const insuranceDistribution = await MobileCrisis.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$primaryInsurance", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 16. Age Group Distribution
    const ageGroupDistribution = await MobileCrisis.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$ageGroup", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 17. Veteran Status Distribution
    const veteranStatusDistribution = await MobileCrisis.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$veteranStatus", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 18. Military Service Status Distribution
    const militaryServiceDistribution = await MobileCrisis.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$servingInMilitary", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Helper function to convert minutes to hours
    const minutesToHours = (minutes: number): number => {
      return Math.round((minutes / 60) * 100) / 100; // Round to 2 decimal places
    };

    // Build response object
    const result = {
      month: `${y}-${m.toString().padStart(2, "0")}`,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      
      // Referrals
      referralsToMobileCrisis: referralsBySource.map(r => ({ 
        source: r._id, 
        count: r.count 
      })),
      
      // Dispatches
      totalDispatches: totalDispatches[0]?.total || 0,
      
      dispatchesByCounty: dispatchesByCounty.map(d => ({ 
        county: d._id, 
        count: d.count 
      })),
      
      dispatchesByCrisisType: dispatchesByCrisisType.map(d => ({ 
        crisisType: d._id, 
        count: d.count 
      })),
      
      // Outcomes
      outcomes: outcomesByType.map(o => ({ 
        outcome: o._id, 
        count: o.count 
      })),
      
      // Response Times
      responseTime: {
        totalMinutes: responseTime[0]?.totalMinutes || 0,
        totalHours: minutesToHours(responseTime[0]?.totalMinutes || 0),
        recordsCount: responseTime[0]?.totalRecords || 0
      },
      
      meanResponseTime: {
        minutes: Math.round(meanResponseTime[0]?.avgMinutes || 0),
        hours: minutesToHours(meanResponseTime[0]?.avgMinutes || 0)
      },
      
      // On-Scene Times
      onSceneTime: {
        totalMinutes: onSceneTime[0]?.totalMinutes || 0,
        totalHours: minutesToHours(onSceneTime[0]?.totalMinutes || 0),
        recordsCount: onSceneTime[0]?.totalRecords || 0
      },
      
      meanOnSceneTime: {
        minutes: Math.round(meanOnSceneTime[0]?.avgMinutes || 0),
        hours: minutesToHours(meanOnSceneTime[0]?.avgMinutes || 0)
      },
      
      // Referrals
      referrals: {
        totalGiven: totalReferrals[0]?.total || 0,
        byType: referralsByType.map(r => ({ 
          type: r._id, 
          count: r.count 
        }))
      },
      
      // Naloxone
      naloxoneDispensations: totalNaloxone[0]?.total || 0,
      
      // Follow-ups
      followUpContacts: totalFollowUps[0]?.total || 0,
      
      // Individuals
      individualsServed: totalIndividuals[0]?.total || 0,
      
      // Demographics
      demographics: {
        primaryInsurance: insuranceDistribution.map(i => ({ 
          insurance: i._id, 
          count: i.count 
        })),
        
        ageGroups: ageGroupDistribution.map(a => ({ 
          ageGroup: a._id, 
          count: a.count 
        })),
        
        veteranStatus: veteranStatusDistribution.map(v => ({ 
          status: v._id, 
          count: v.count 
        })),
        
        militaryService: militaryServiceDistribution.map(m => ({ 
          status: m._id, 
          count: m.count 
        }))
      }
    };

    return res.status(200).json(result);
    
  } catch (error: any) {
    console.error("Error in getMobileCrisisSummary:", error);
    return res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};