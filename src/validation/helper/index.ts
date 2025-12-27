import Joi from "joi";

export const getJoiUpdateSchema = (
  create: Joi.ObjectSchema,
  forbiddenFields: string[],
): Joi.ObjectSchema => {
  const createKeys = create.describe().keys;

  const updateSchema: Record<string, Joi.Schema> = {};

  for (const key of Object.keys(createKeys)) {
    if (forbiddenFields.includes(key)) {
      updateSchema[key] = Joi.forbidden(); // ❌ must not exist
    } else {
      updateSchema[key] = create.extract(key).optional(); // ✅ optional
    }
  }
  return Joi.object(updateSchema).min(1);
}
