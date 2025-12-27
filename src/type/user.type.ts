import type { EUserRole, EUserStatus } from "@/enum";
import type { Model, Types } from "mongoose";
import type { ITimestamps, Ref } from "./common.type";
import type { IBusiness } from "./business.type";

/**
 * IUserMethods contains all instance methods for a user
 * @interface IUserMethods
 * @method comparePassword - Compares a candidate password with the stored password
 * @method changePassword - Changes the user's password to a new password
 */
export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  changePassword(newPassword: string): Promise<void>;
}

/**
 * IUser represents a user document
 */
export interface IUser extends ITimestamps, IUserMethods {
  id: Types.ObjectId;
  full_name?: string;
  phone_number?: string;
  email?: string;
  image?: string;
  password: string;
  role: EUserRole;
  password_changed_at: number; // milliseconds
  status: EUserStatus;
  business_type?: string; // only for business users
  industry?: string; // only for business users
  business?: Ref<IBusiness>; // only for clerks and customers
  mfa_enabled?: boolean; // only for clerks and business
  facebook_url?: string; // only for customers
  additional_information?: string; // only for customers
  assigned_clerk?: Ref<IUser>; // only for customers
}

/**
 * UserModel type for statics and generics
 */
export type UserModel = Model<IUser, {}, IUserMethods>;
