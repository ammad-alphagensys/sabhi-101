import { BusinessIndustry } from "@/model";
import { createOne, deleteOne, getOne, getAll, updateOne } from "./handler_factory.ts";
import { createBusinessIndustryJoi, updateBusinessIndustryJoi } from "@/validation";

export const createBusinessIndustry = createOne(BusinessIndustry, {
  schema: createBusinessIndustryJoi,
});

export const updateBusinessIndustry = updateOne(BusinessIndustry, {
  schema: updateBusinessIndustryJoi,
});
export const deleteBusinessIndustry = deleteOne(BusinessIndustry);
export const getBusinessIndustry = getOne(BusinessIndustry);
export const getBusinessIndustries = getAll(BusinessIndustry);
