import { model } from "mongoose";
import { EModalNames } from "@/enum";

import {
  userSchema,
  businessIndustrySchema,
  businessSchema,
} from "@/schema";

export const User = model(EModalNames.USER, userSchema);
export const BusinessIndustry = model(EModalNames.BUSINESS_INDUSTRY, businessIndustrySchema);
export const Business = model(EModalNames.BUSINESS, businessSchema);
