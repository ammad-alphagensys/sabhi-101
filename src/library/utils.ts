import { Model, Types } from "mongoose";
import { Constant } from "@/constant";
import jwt from "jsonwebtoken";
import Joi, { type AnySchema } from "joi";
import { RedisCache } from "./redis-cache";
import { User } from "@/model";
import { s3upload } from "./s3";
import { multerUpload } from "./multer";

/**
 * Recursively makes fields in a Joi schema optional.
 * @param schema - Joi schema object (Joi.object)
 * @param options - Options to exclude certain fields from being optional
 * @returns New Joi schema with optional fields except excluded ones
 *
 * @example
 * const optionalSchema = makeOptionalAndExcludeValues(createSchema, ["business","status"]);
 */
export function makeOptionalAndExcludeValues<T extends AnySchema>(
  schema: T,
  ...excludeFields: string[]
): AnySchema {
  // Check if schema is an object schema
  if (schema.type === "object" || (schema as any)._type === "object") {
    const keys = (schema as any)._ids?._byKey || (schema as any)._inner?.children;
    if (!keys) return schema.optional();

    const newKeys: Record<string, AnySchema> = {};
    for (const key in keys) {
      const childSchema = keys[key]?.schema || keys[key]?.schema; // safe extract
      if (excludeFields.includes(key)) {
        newKeys[key] = childSchema;
      } else {
        newKeys[key] = makeOptionalAndExcludeValues(childSchema);
      }
    }

    return Joi.object(newKeys).optional();
  }

  // If schema is an array, make its items optional recursively
  const schemaDesc = (schema as any).describe?.();
  if (schemaDesc?.type === "array") {
    const items = (schema as any)._inner?.items || (schema as any)._items;
    if (items?.length) {
      return Joi.array().items(makeOptionalAndExcludeValues(items[0])).optional();
    }
  }

  // Primitive schema (string, number, etc.)
  return schema.optional();
}


/**
 * Mongoose: Flatten the body to allow dot-notation update,
 * including nested fields and arrays like "addresses.0.state"
 */
export const flatten = (obj: any, prefix = ''): any => {
  return Object.keys(obj).reduce((acc: any, k) => {
    const pre = prefix.length ? `${prefix}.` : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flatten(obj[k], pre + k));
    } else if (Array.isArray(obj[k])) {
      obj[k].forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          Object.assign(acc, flatten(item, `${pre}${k}.${index}`));
        } else {
          acc[`${pre}${k}.${index}`] = item;
        }
      });
    } else {
      acc[`${pre}${k}`] = obj[k];
    }
    return acc;
  }, {});
};

/**
 * Uploads Media Files Using Either Multer (Local) Or S3 Based On The Environment.
 * Local - Public Directory: `public/media`
 */
export const mediaUpload = process.env.NODE_ENV === "production" ? s3upload : multerUpload;

/**
 * Constructs a Route String With The Specified Version Of The API.
 * @param {string} route - The Route To Be Appended To The API Version.
 * @returns {string} The Complete Route String With The API Version Appended.
 * @example
 * ```typescript
 * const versionedRoute = routeWdVersion("users");
 * // Returns: "/api/v1/users"
 * ```
 */
export const routeWdVersion = (route: string): string =>
  `/api/${Constant.instance.server.apiVersion}/${route}`;

/**
 * Generates Access And Refresh Tokens Based On The Provided Payload.
 * @param {Object} payload - The Payload Containing User ID And Token Type.
 * @param {Types.ObjectId} payload.id - The Unique Identifier Of The User.
 * @param {number} payload.type - The Type Of Token To Be Generated, Must Be 0 For Normal & 1 For ForgetPasswordToken
 * @returns {Object} An Object Containing The AccessToken And RefreshToken.
 * @throws {Error} Throws An Error If Required JWT Secrets Or Expiration Values Are Missing.
 * @example
 * ```typescript
 * const payload = { id: new Types.ObjectId(), type: 1 };
 * const tokens = getToken(payload);
 * // Returns: { accessToken: '...', refreshToken: '...' }
 * ```
 */
export const getToken = (payload: {
  id: Types.ObjectId;
  type: number;
}): { accessToken: string; refreshToken: string } => {
  const { accessSecret, accessExpire, refreshSecret, refreshExpire } =
    Constant.instance.jwt;

  const accessToken = jwt.sign(payload, accessSecret!, {
    // expiresIn: accessExpire,
  });
  const refreshToken = jwt.sign(payload, refreshSecret!, {
    // expiresIn: refreshExpire,
  });

  return { accessToken, refreshToken };
};

/**
 * Validates An Object Against The Provided Joi Schema.
 * @param {Joi.ObjectSchema} joiSchema - The Joi Schema To Validate Against.
 * @param {any} body - The Object To Be Validated.
 * @returns {Joi.ValidationResult} The Result Of The Validation, Including Any Validation Errors.
 * @example
 * ```typescript
 *   const schema = Joi.object({
 *   username: Joi.string().alphanum().min(3).max(30).required(),
 *   password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
 * });
 * const requestBody = { username: 'example', password: 'password123' };
 * const validationResult = joiHelper(schema, requestBody);
 * // Returns: { error: null, value: { username: 'example', password: 'password123' } }
 * ```
 */
export const joiHelper = (
  joiSchema: Joi.ObjectSchema,
  body: any,
): { error: any; value: any } => {
  return joiSchema.validate(body, { abortEarly: false });
};

/**
 * Invalidates cache entries associated with a user, optionally invalidating photo URLs as well.
 * @param {string} userId - The ID of the user whose cache entries should be invalidated.
 * @param {boolean} [invalidPhotoUrl=true] - Whether to invalidate photo URLs cache entries.
 * @param {Model<any>} [model=User] - The Mongoose model associated with the cache entries. Defaults to the User model.
 * @returns {Promise<void>} A Promise that resolves when the cache invalidation is complete.
 * @example
 * ```typescript
 * await invalidateUserCache('1234567890');
 * // Invalidates cache entries associated with the user with ID '1234567890'.
 *
 * await invalidateUserCache('1234567890', true, CustomUserModel);
 * // Invalidates cache entries associated with the user with ID '1234567890' using a custom user model.
 * ```
 */
export const invalidateUserCache = async (
  userId: string,
  invalidPhotoUrl: boolean = true,
  model: Model<any> = User,
): Promise<undefined> => {
  const client = RedisCache.instance.client;

  /** 1) Getting All <MODAL> Keys */
  let extractedKeys = await client.keys(`*${model.modelName}*`);

  /** 2) Filter Keys - <invalidate all __ getAllDocs & this specific Doc>*/
  extractedKeys = extractedKeys.filter((key) => {
    const parsedKey = JSON.parse(key);
    /**
     * It Will Invalidate:
     * 1) Current User Cache - key: {collection:'User','id':<current user id>}
     * 2) All User Cache - key: {collection:'User', ...* }
     */
    if (invalidPhotoUrl) return parsedKey.id === userId || !parsedKey.id;

    /**
     * It Will Invalidate:
     * 1) Current User Cache - key: {collection:'User','id':<current user id>}
     * 2) All User Cache - key: {collection:'User', ...* }
     * 3) Remember It Will Not Invalidate GetMePhoto & GetMeCoverPhoto
     * -- key: {collection:'User','id':<current user id>,select:'photo/cover_photo'}
     */
    return (
      (parsedKey.id === userId || !parsedKey.id) &&
      !parsedKey.photo &&
      !parsedKey.cover_photo
    );
  });

  /** delete cache data */
  if (extractedKeys.length > 0) await client.del(extractedKeys);
};

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
