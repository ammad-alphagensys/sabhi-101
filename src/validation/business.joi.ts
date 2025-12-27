import { getJoiUpdateSchema } from './helper/';
import { EUserStatus } from '@/enum';
import Joi from 'joi';

const create = Joi.object({
  name: Joi.string().optional(),
  user: Joi.string().hex().length(24).required(),
  industry: Joi.string().hex().length(24).required(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  zip_code: Joi.string().optional(),
  status: Joi.number().valid(...Object.values(EUserStatus).filter(e => typeof e === 'number')).optional(),
  image: Joi.string().optional(),
  facebook_url: Joi.string().optional(),
  description: Joi.string().optional(),
  business_type: Joi.string().optional(),
  operating_hours: Joi.string().optional(),
  preferred_channel: Joi.string().optional(),
  notification_channel: Joi.string().optional(),
  whatsapp: Joi.string().optional(),
  license_number: Joi.string().optional(),
});

const forbiddenFields: string[] = ['created_at', 'updated_at', 'user',];

const update = getJoiUpdateSchema(create, forbiddenFields);

export { create as createBusinessJoi, update as updateBusinessJoi };

