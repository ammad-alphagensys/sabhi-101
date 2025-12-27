import { getJoiUpdateSchema } from "./helper/";
import { EUserRole, EUserStatus } from "@/enum";
import Joi from "joi";

const create = Joi.object({
  full_name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone_number: Joi.string().required(),
  password: Joi.string().required(),
  image: Joi.string().optional(),
  role: Joi.string()
    .valid(...Object.values(EUserRole))
    .required(),
  status: Joi.string()
    .valid(...Object.values(EUserStatus).filter((e) => typeof e === "number"))
    .optional(),
  business_type: Joi.when("role", {
    is: Joi.valid(EUserRole.BUSINESS),
    then: Joi.string().required(),
    otherwise: Joi.forbidden(), // raises an error if provided
  }),
  industry: Joi.when("role", {
    is: Joi.valid(EUserRole.BUSINESS),
    then: Joi.string().hex().length(24).required(),
    otherwise: Joi.forbidden(), // raises an error if provided
  }),

  business: Joi.when("role", {
    is: Joi.valid(EUserRole.CLERK, EUserRole.CUSTOMER),
    then: Joi.string().hex().length(24).required(),
    otherwise: Joi.forbidden(), // raises an error if provided
  }),
  mfa_enabled: Joi.when("role", {
    is: Joi.valid(EUserRole.CLERK, EUserRole.BUSINESS),
    then: Joi.string().hex().length(24).required(),
    otherwise: Joi.forbidden(), // raises an error if provided
  }),
  facebook_url: Joi.when("role", {
    is: EUserRole.CUSTOMER, // replace with actual enum value
    then: Joi.string().required(),
    otherwise: Joi.forbidden(), // raises an error if provided
  }),

  additional_information: Joi.when("role", {
    is: EUserRole.CUSTOMER, // replace with actual enum value
    then: Joi.string().required(),
    otherwise: Joi.forbidden(), // raises an error if provided
  }),
  assigned_clerk: Joi.when("role", {
    is: EUserRole.CUSTOMER, // replace with actual enum value
    then: Joi.string().required(),
    otherwise: Joi.forbidden(), // raises an error if provided
  }),
});

const forbiddenFields: string[] = ["created_at", "updated_at", "user", "name"];

const update = getJoiUpdateSchema(create, forbiddenFields);

export { create as createUserJoi, update as updateUserJoi };
