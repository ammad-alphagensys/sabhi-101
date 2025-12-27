import { getJoiUpdateSchema } from "./helper/";
import Joi from "joi";

const create = Joi.object({
  name: Joi.string().required(),
  user: Joi.string().hex().length(24).required(),
  parent_industry: Joi.string().hex().length(24).optional(),
  is_active: Joi.boolean().optional(),
});

const forbiddenFields: string[] = ["created_at", "updated_at", "user"];

const update = getJoiUpdateSchema(create, forbiddenFields);

export { create as createBusinessIndustryJoi, update as updateBusinessIndustryJoi };
