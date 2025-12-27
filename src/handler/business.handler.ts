import { Business } from "@/model";
import { createOne, deleteOne, getOne, getAll, updateOne } from "./handler_factory.ts";
import { createBusinessJoi, updateBusinessJoi } from "@/validation";

export const createBusiness = createOne(Business, {
  schema: createBusinessJoi,
});

export const updateBusiness = updateOne(Business, { schema: updateBusinessJoi });
export const deleteBusiness = deleteOne(Business);
export const getBusiness = getOne(Business);
export const getBusinesses = getAll(Business);
