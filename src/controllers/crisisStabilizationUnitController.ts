import { Request, Response } from "express";
import CrisisStabilization from "../models/crisisStabilizationUnitModel";

export const createCrisisStabilization = async (req: Request, res: Response) => {
  try {
    const user = req.user; // from protectUser middleware
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const {
     referralsToCrisisStabilization,
     numberOfVisits,
     crisisTypes,
     outcome,
     totalStabilizationTime,
     meanStabilizationTime,
     referralsGiven,
     referralsByType,
     naloxoneDispensations,
     followUpContacts,
     individualsServed,
     clientCountyOfResidence,
     clientPrimaryInsurance,
     clientAgeGroups,
     clientVeteranStatus,
     clientServingInMilitary
    } = req.body;

    const stabilizationRecord = await CrisisStabilization.create({
      userId: user._id,
     referralsToCrisisStabilization,
     numberOfVisits,
     crisisTypes,
     outcome,
     totalStabilizationTime,
     meanStabilizationTime,
     referralsGiven,
     referralsByType,
     naloxoneDispensations,
     followUpContacts,
     individualsServed,
     clientCountyOfResidence,
     clientPrimaryInsurance,
     clientAgeGroups,
     clientVeteranStatus,
     clientServingInMilitary
    });

    return res.status(201).json({
      success: true,
      message: "Crisis stabilization record created successfully",
      data: stabilizationRecord,
    });
  } catch (error: any) {
    console.error("Error creating crisis stabilization record:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating crisis stabilization record",
      error: error.message,
    });
  }
};

export const getCrisisStabilizationSummary = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ 
        message: "Please provide both year and month (e.g. ?year=2025&month=11)" 
      });
    }

    const y = parseInt(year as string);
    const m = parseInt(month as string);

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 1);

    const dateFilter = { createdAt: { $gte: startDate, $lt: endDate } };

    // Get total records count first
    const totalRecords = await CrisisStabilization.countDocuments(dateFilter);

    // 1. Referrals to Crisis Stabilization (Count by Referral Source)
    const referralsBySource = await CrisisStabilization.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$referralsToCrisisStabilization", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 2. Total Number of Visits
    const totalVisits = await CrisisStabilization.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: "$numberOfVisits" } } }
    ]);

    // 3. Crisis Types Distribution
    const crisisTypesDistribution = await CrisisStabilization.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$crisisTypes", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 4. Outcome of Crisis Stabilization
    const outcomesByType = await CrisisStabilization.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$outcome", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 5. Total Stabilization Time
    const stabilizationTime = await CrisisStabilization.aggregate([
      { $match: dateFilter },
      { 
        $group: { 
          _id: null, 
          totalMinutes: { $sum: "$totalStabilizationTime" },
          avgMinutes: { $avg: "$totalStabilizationTime" },
          minMinutes: { $min: "$totalStabilizationTime" },
          maxMinutes: { $max: "$totalStabilizationTime" },
          totalRecords: { $sum: 1 }
        } 
      }
    ]);

    // 6. Mean Stabilization Time (from meanStabilizationTime field)
    const meanStabilizationTime = await CrisisStabilization.aggregate([
      { $match: dateFilter },
      { 
        $group: { 
          _id: null, 
          avgMinutes: { $avg: "$meanStabilizationTime" }
        } 
      }
    ]);

    // 7. Total Referrals Given
    const totalReferrals = await CrisisStabilization.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: "$referralsGiven" } } }
    ]);

    // 8. Referrals by Type
    const referralsByType = await CrisisStabilization.aggregate([
      { $match: { ...dateFilter, referralsByType: { $exists: true, $ne: null } } },
      { 
        $group: { 
          _id: "$referralsByType", 
          totalReferrals: { $sum: "$referralsGiven" },
          recordCount: { $sum: 1 }
        } 
      },
      { $sort: { totalReferrals: -1 } }
    ]);

    // 9. Total Naloxone Dispensations
    const totalNaloxone = await CrisisStabilization.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: "$naloxoneDispensations" } } }
    ]);

    // 10. Total Follow-Up Contacts
    const totalFollowUps = await CrisisStabilization.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: "$followUpContacts" } } }
    ]);

    // 11. Total Individuals Served
    const totalIndividuals = await CrisisStabilization.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: "$individualsServed" } } }
    ]);

    // 12. Client County of Residence Distribution
    const countyDistribution = await CrisisStabilization.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$clientCountyOfResidence", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 } // Top 10 counties
    ]);

    // 13. Client Primary Insurance Distribution
    const insuranceDistribution = await CrisisStabilization.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$clientPrimaryInsurance", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 14. Client Age Group Distribution
    const ageGroupDistribution = await CrisisStabilization.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$clientAgeGroups", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 15. Client Veteran Status Distribution
    const veteranStatusDistribution = await CrisisStabilization.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$clientVeteranStatus", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 16. Client Serving in Military Distribution
    const militaryServiceDistribution = await CrisisStabilization.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$clientServingInMilitary", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 17. Crisis Type by Outcome (Cross-tabulation)
    const crisisTypeByOutcome = await CrisisStabilization.aggregate([
      { $match: dateFilter },
      { 
        $group: { 
          _id: { crisisType: "$crisisTypes", outcome: "$outcome" },
          count: { $sum: 1 }
        } 
      },
      { $sort: { "_id.crisisType": 1, count: -1 } }
    ]);

    // 18. Referral Source by Crisis Type (Cross-tabulation)
    const referralSourceByCrisisType = await CrisisStabilization.aggregate([
      { $match: dateFilter },
      { 
        $group: { 
          _id: { 
            referralSource: "$referralsToCrisisStabilization", 
            crisisType: "$crisisTypes" 
          },
          count: { $sum: 1 }
        } 
      },
      { $sort: { "_id.referralSource": 1, count: -1 } }
    ]);

    // Helper function to convert minutes to hours
    const minutesToHours = (minutes: number): number => {
      return Math.round((minutes / 60) * 100) / 100;
    };

    // Helper function to calculate percentage
    const calculatePercentage = (count: number, total: number): number => {
      return total > 0 ? Math.round((count / total) * 10000) / 100 : 0;
    };

    // Build response object
    const result = {
      summary: {
        month: `${y}-${m.toString().padStart(2, "0")}`,
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        totalRecords: totalRecords,
        totalIndividualsServed: totalIndividuals[0]?.total || 0,
        totalVisits: totalVisits[0]?.total || 0,
        averageVisitsPerRecord: totalRecords > 0 ? Math.round(((totalVisits[0]?.total || 0) / totalRecords) * 100) / 100 : 0
      },
      
      referralsToCrisisStabilization: {
        total: referralsBySource.reduce((sum, r) => sum + r.count, 0),
        breakdown: referralsBySource.map(r => ({ 
          source: r._id, 
          count: r.count,
          percentage: calculatePercentage(r.count, totalRecords)
        }))
      },
      
      crisisTypes: {
        total: crisisTypesDistribution.reduce((sum, c) => sum + c.count, 0),
        breakdown: crisisTypesDistribution.map(c => ({ 
          type: c._id, 
          count: c.count,
          percentage: calculatePercentage(c.count, totalRecords)
        }))
      },
      
      outcomes: {
        total: outcomesByType.reduce((sum, o) => sum + o.count, 0),
        breakdown: outcomesByType.map(o => ({ 
          outcome: o._id, 
          count: o.count,
          percentage: calculatePercentage(o.count, totalRecords)
        }))
      },
      
      stabilizationTime: {
        totalMinutes: stabilizationTime[0]?.totalMinutes || 0,
        totalHours: minutesToHours(stabilizationTime[0]?.totalMinutes || 0),
        averageMinutes: Math.round(stabilizationTime[0]?.avgMinutes || 0),
        averageHours: minutesToHours(stabilizationTime[0]?.avgMinutes || 0),
        minMinutes: stabilizationTime[0]?.minMinutes || 0,
        maxMinutes: stabilizationTime[0]?.maxMinutes || 0,
        recordsCount: stabilizationTime[0]?.totalRecords || 0
      },
      
      meanStabilizationTime: {
        minutes: Math.round(meanStabilizationTime[0]?.avgMinutes || 0),
        hours: minutesToHours(meanStabilizationTime[0]?.avgMinutes || 0)
      },
      
      referrals: {
        totalGiven: totalReferrals[0]?.total || 0,
        averagePerRecord: totalRecords > 0 ? Math.round(((totalReferrals[0]?.total || 0) / totalRecords) * 100) / 100 : 0,
        byType: referralsByType.map(r => ({ 
          type: r._id, 
          totalReferrals: r.totalReferrals,
          recordCount: r.recordCount,
          averagePerRecord: r.recordCount > 0 ? Math.round((r.totalReferrals / r.recordCount) * 100) / 100 : 0,
          percentage: calculatePercentage(r.recordCount, totalRecords)
        }))
      },
      
      naloxoneDispensations: {
        total: totalNaloxone[0]?.total || 0,
        averagePerRecord: totalRecords > 0 ? Math.round(((totalNaloxone[0]?.total || 0) / totalRecords) * 100) / 100 : 0
      },
      
      followUpContacts: {
        total: totalFollowUps[0]?.total || 0,
        averagePerRecord: totalRecords > 0 ? Math.round(((totalFollowUps[0]?.total || 0) / totalRecords) * 100) / 100 : 0
      },
      
      clientDemographics: {
        countyOfResidence: {
          total: countyDistribution.reduce((sum, c) => sum + c.count, 0),
          topCounties: countyDistribution.map(c => ({ 
            county: c._id, 
            count: c.count,
            percentage: calculatePercentage(c.count, totalRecords)
          }))
        },
        
        primaryInsurance: {
          total: insuranceDistribution.reduce((sum, i) => sum + i.count, 0),
          breakdown: insuranceDistribution.map(i => ({ 
            insurance: i._id, 
            count: i.count,
            percentage: calculatePercentage(i.count, totalRecords)
          }))
        },
        
        ageGroups: {
          total: ageGroupDistribution.reduce((sum, a) => sum + a.count, 0),
          breakdown: ageGroupDistribution.map(a => ({ 
            ageGroup: a._id, 
            count: a.count,
            percentage: calculatePercentage(a.count, totalRecords)
          }))
        },
        
        veteranStatus: {
          total: veteranStatusDistribution.reduce((sum, v) => sum + v.count, 0),
          breakdown: veteranStatusDistribution.map(v => ({ 
            status: v._id, 
            count: v.count,
            percentage: calculatePercentage(v.count, totalRecords)
          }))
        },
        
        servingInMilitary: {
          total: militaryServiceDistribution.reduce((sum, m) => sum + m.count, 0),
          breakdown: militaryServiceDistribution.map(m => ({ 
            status: m._id, 
            count: m.count,
            percentage: calculatePercentage(m.count, totalRecords)
          }))
        }
      },

      crossTabulations: {
        crisisTypeByOutcome: crisisTypeByOutcome.map(item => ({
          crisisType: item._id.crisisType,
          outcome: item._id.outcome,
          count: item.count
        })),
        
        referralSourceByCrisisType: referralSourceByCrisisType.map(item => ({
          referralSource: item._id.referralSource,
          crisisType: item._id.crisisType,
          count: item.count
        }))
      }
    };

    return res.status(200).json(result);
    
  } catch (error: any) {
    console.error("Error in getCrisisStabilizationSummary:", error);
    return res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};