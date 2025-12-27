import type { Types } from "mongoose";
import type { ITimestamps, Ref } from "./common.type";
import type { IUser } from "./user.type";
/**
 * IBusinessIndustry represents a business industry document
 * @interface IBusinessIndustry
 * @property {Types.ObjectId} id - The unique identifier for the business industry
 * @property {string} name - The name of the business industry
 * @property {Ref<IBusinessIndustry>} [parent_industry] - Reference to the parent industry, if any
 * @property {Ref<IUser>} user - Reference to the user who created or manages the industry
 * @property {boolean} is_active - Indicates if the industry is active
 * @property {Date} created_at - The date when the industry was created
 * @property {Date} updated_at - The date when the industry was last updated
 * @extends ITimestamps for created_at and updated_at properties
 */

export interface IBusinessIndustry extends ITimestamps {
  id: Types.ObjectId;
  name: string;
  user: Ref<IUser>;
  parent_industry?: Ref<IBusinessIndustry>;
  is_active: boolean;
}
