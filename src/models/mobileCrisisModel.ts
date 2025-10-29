import mongoose, { Schema, Document } from "mongoose";

// 1️⃣ Interface for TypeScript type safety
export interface IMobileCrisis extends Document {
  userId: string;
  referralSource: string;
  totalDispatches?: number;
  dispatchCounty: string;
  crisisType: string;
  outcome: string;
  totalResponseTime?: number;
  meanResponseTime?: number;
  totalOnSceneTime?: number;
  meanOnSceneTime?: number;
  referralsGiven?: number;
  referralType?: string;
  naloxoneDispensations?: number;
  followUpContacts?: number;
  individualsServed?: number;
  primaryInsurance: string;
  ageGroup: string;
  veteranStatus: string;
  servingInMilitary: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2️⃣ Enum Lists
const referralSources = [
  "Law Enforcement/Justice System",
  "EMS",
  "Medical Hospitals",
  "Psychiatric Hospitals",
  "Behavioral Health Providers",
  "Schools",
  "Department of Child Services",
  "Faith-Based Organizations",
  "Housing Shelters",
  "Family and Friends",
  "Self",
  "Primary Healthcare",
  "Social Service Agency",
  "988",
  "911",
  "Other",
];

const countries = [
  "adams co.",
  "allen co.",
  "bartholomew co.",
  "benton co.",
  "blackford co.",
  "boone co.",
  "brown co.",
  "carroll co.",
  "cass co.",
  "clark co.",
  "clay co.",
  "clinton co.",
  "crawford co.",
  "daviess co.",
  "dearborn co.",
  "decatur co.",
  "dekalb co.",
  "delaware co.",
  "dubois co.",
  "elkhart co.",
  "fayette co.",
  "floyd co.",
  "fountain co.",
  "franklin co.",
  "fulton co.",
  "gibson co.",
  "grant co.",
  "greene co.",
  "hamilton co.",
  "hancock co.",
  "harrison co.",
  "hendricks co.",
  "henry co.",
  "howard co.",
  "huntington co.",
  "jackson co.",
  "jasper co.",
  "jay co.",
  "jefferson co.",
  "jennings co.",
  "johnson co.",
  "knox co.",
  "kosciusko co.",
  "lagrange co.",
  "lake co.",
  "laporte co.",
  "lawrence co.",
  "madison co.",
  "marion co.",
  "marshall co.",
  "martin co.",
  "miami co.",
  "monroe co.",
  "montgomery co.",
  "morgan co.",
  "newton co.",
  "noble co.",
  "ohio co.",
  "orange co.",
  "owen co.",
  "parke co.",
  "perry co.",
  "pike co.",
  "porter co.",
  "posey co.",
  "pulaski co.",
  "putnam co.",
  "randolph co.",
  "ripley co.",
  "rush co.",
  "scott co.",
  "shelby co.",
  "spencer co.",
  "st. joseph co.",
  "starke co.",
  "steuben co.",
  "sullivan co.",
  "switzerland co.",
  "tippecanoe co.",
  "tipton co.",
  "union co.",
  "vanderburgh co.",
  "vermillion co.",
  "vigo co.",
  "wabash co.",
  "warren co.",
  "warrick co.",
  "washington co.",
  "wayne co.",
  "wells co.",
  "white co.",
  "whitley co.",
];

const crisisTypes = [
  "Suicide Risk",
  "At Risk of Hurting Others",
  "Adult Mental Health",
  "Youth Mental Health",
  "Substance Use",
  "Other",
];

const outcomes = [
  "Stabilized in the Community",
  "Sent to a Crisis Stabilization Unit",
  "Sent to the Emergency Room/Called EMS",
  "Law Enforcement Custody",
  "Sent to an Inpatient Psychiatric Facility",
  "Sent to a Substance Use Treatment Facility",
  "Other",
];

const referralTypes = [
  "Social Service Agency",
  "Mental Health Services/Treatment",
  "Substance Use Treatment",
  "Primary Health Care",
  "Domestic Violence Support",
  "Other",
];

const primaryInsurances = [
  "Medicaid (not dually-eligible)",
  "HIP",
  "Medicare (not dually-eligible)",
  "Medicaid and Medicare (dually-eligible)",
  "Commercially Insured",
  "VHA/TRI Care",
  "CHIP",
  "Uninsured",
  "Other",
];

const ageGroups = [
  "0–5 years",
  "6–12 years",
  "13–17 years",
  "18–20 years",
  "21–24 years",
  "25–44 years",
  "45–64 years",
  "65 years or over",
  "Unknown",
];
                
const veteranStatuses = [
  "Yes",
  "No",
  "Not Applicable (Client under 18 years of age)",
];

const servingStatuses = [
  "Yes",
  "No",
  "Refused",
  "Not Applicable (Client under 18 years of age)",
];

// 3️⃣ Schema Definition
const mobileCrisisSchema = new Schema<IMobileCrisis>(
  {
    userId: String,

    referralSource: {
      type: String,
      required: true,
      enum: referralSources,
      trim: true,
    },

    totalDispatches: { type: Number,  default: 0 },

    dispatchCounty: {
      type: String,
      required: true,
      enum: countries,
      trim: true,
    },

    crisisType: {
      type: String,
      required: true,
      enum: crisisTypes,
      trim: true,
    },

    outcome: {
      type: String,
      required: true,
      enum: outcomes,
      trim: true,
    },

    totalResponseTime: { type: Number, default: 0 },
    meanResponseTime: { type: Number, default: 0 },
    totalOnSceneTime: { type: Number, default: 0 },
    meanOnSceneTime: { type: Number, default: 0 },
    referralsGiven: { type: Number, default: 0 },

    referralType: {
      type: String,
      enum: referralTypes,
      trim: true,
    },

    naloxoneDispensations: { type: Number, default: 0 },
    followUpContacts: { type: Number, default: 0 },
    individualsServed: { type: Number, default: 0 },

    primaryInsurance: {
      type: String,
      required: true,
      enum: primaryInsurances,
      trim: true,
    },

    ageGroup: {
      type: String,
      required: true,
      enum: ageGroups,
      trim: true,
    },

    veteranStatus: {
      type: String,
      required: true,
      enum: veteranStatuses,
      trim: true,
    },

    servingInMilitary: {
      type: String,
      required: true,
      enum: servingStatuses,
      trim: true,
    },
  },
  { timestamps: true }
);

// 4️⃣ Model Export
const MobileCrisis = mongoose.model<IMobileCrisis>(
  "MobileCrisis",
  mobileCrisisSchema
);

export default MobileCrisis;
