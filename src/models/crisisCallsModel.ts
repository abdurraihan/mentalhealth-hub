import mongoose, { Schema, Document } from "mongoose";

// 1️⃣ Interface for TypeScript type safety
export interface ICrisisCall extends Document {
  userId: string,
  callByCountry: string;
  crisisType: string;
  description?: string; 
  createdAt: Date;
  updatedAt: Date;
}

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


const crisisCallSchema = new Schema<ICrisisCall>(
  {
    userId: String,
    callByCountry: {
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
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);


const CrisisCall = mongoose.model<ICrisisCall>("CrisisCall", crisisCallSchema);
export default CrisisCall;
