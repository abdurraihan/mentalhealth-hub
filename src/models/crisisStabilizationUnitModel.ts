import mongoose, { Schema, Document } from "mongoose";

// 1️⃣ Interface for TypeScript type safety
export interface ICrisisStabilization extends Document {
  userId: string;
  referralsToCrisisStabilization: string;
  numberOfVisits?: number;
  crisisTypes: string;
  outcome: string;
  totalStabilizationTime?: number;
  meanStabilizationTime?: number;
  referralsGiven?: number;
  referralsByType?: string;
  naloxoneDispensations?: number;
  followUpContacts?: number;
  individualsServed?: number;
  clientCountyOfResidence: string;
  clientPrimaryInsurance: string;
  clientAgeGroups: string;
  clientVeteranStatus: string;
  clientServingInMilitary: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2️⃣ Enum Lists
const referralsToCrisisStabilizationOptions = [
  "Law Enforcement/Justice System",
  "EMS",
  "Mobile Crisis Team",
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

const crisisTypesOptions = [
  "Suicide Risk",
  "At Risk of Hurting Others",
  "Adult Mental Health",
  "Youth Mental Health",
  "Substance Use",
  "Other",
];

const outcomeOptions = [
  "Stabilized in the Community",
  "Sent to the Emergency Room/Called EMS",
  "Law Enforcement Custody",
  "Sent to an Inpatient Psychiatric Facility",
  "Sent to a Substance Use Treatment Facility",
  "Other",
];

const referralsByTypeOptions = [
  "Social Service Agency",
  "Mental Health Services/Treatment",
  "Substance Use Treatment",
  "Primary Health Care",
  "Domestic Violence Support",
  "Other",
];

const clientCountyOfResidenceOptions = [
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

const clientPrimaryInsuranceOptions = [
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

const clientAgeGroupsOptions = [
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

const clientVeteranStatusOptions = [
  "Yes",
  "No",
  "Not Applicable (Client under 18 years of age)",
];

const clientServingInMilitaryOptions = [
  "Yes",
  "No",
  "Refused",
  "Not Applicable (Client under 18 years of age)",
];

// 3️⃣ Schema Definition
const crisisStabilizationSchema = new Schema<ICrisisStabilization>(
  {
    userId: String,

    referralsToCrisisStabilization: {
      type: String,
      required: true,
      enum: referralsToCrisisStabilizationOptions,
      trim: true,
    },

    numberOfVisits: { type: Number, default: 0 },

    crisisTypes: {
      type: String,
      required: true,
      enum: crisisTypesOptions,
      trim: true,
    },

    outcome: {
      type: String,
      required: true,
      enum: outcomeOptions,
      trim: true,
    },

    totalStabilizationTime: { type: Number, default: 0 },
    meanStabilizationTime: { type: Number, default: 0 },
    referralsGiven: { type: Number, default: 0 },

    referralsByType: {
      type: String,
      enum: referralsByTypeOptions,
      trim: true,
    },

    naloxoneDispensations: { type: Number, default: 0 },
    followUpContacts: { type: Number, default: 0 },
    individualsServed: { type: Number, default: 0 },

    clientCountyOfResidence: {
      type: String,
      required: true,
      enum: clientCountyOfResidenceOptions,
      trim: true,
    },

    clientPrimaryInsurance: {
      type: String,
      required: true,
      enum: clientPrimaryInsuranceOptions,
      trim: true,
    },

    clientAgeGroups: {
      type: String,
      required: true,
      enum: clientAgeGroupsOptions,
      trim: true,
    },

    clientVeteranStatus: {
      type: String,
      required: true,
      enum: clientVeteranStatusOptions,
      trim: true,
    },

    clientServingInMilitary: {
      type: String,
      required: true,
      enum: clientServingInMilitaryOptions,
      trim: true,
    },
  },
  { timestamps: true }
);

// 4️⃣ Model Export
const CrisisStabilization = mongoose.model<ICrisisStabilization>(
  "CrisisStabilization",
  crisisStabilizationSchema
);

export default CrisisStabilization;