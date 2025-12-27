import type { IUser } from "@/type";
import crypto from "crypto";
import { type HydratedDocument, Query } from "mongoose";

// Hash password before save to db
export const hashPasswordBeforeSave = async function (
  this: HydratedDocument<IUser>,
) {
  //  NOTE: Only run this function if password was actually modified
  if (!this.isModified("password")) return;

  const hashPswrd = await Bun.password.hash(this.password, {
    algorithm: "bcrypt",
    cost: 12, // number between 4-31
  });

  this.password = hashPswrd;
  this.password_changed_at = Date.now();
};

/**
 * Middleware to hash password before findOneAndUpdate / updateOne / updateMany
 */
export const hashPasswordBeforeUpdate = async function (
  this: Query<any, IUser>,
) {
  const update = this.getUpdate() as Record<string, any>;

  if (update?.password) {
    const hashPswrd = await Bun.password.hash(update.password, {
      algorithm: "bcrypt",
      cost: 12,
    });

    update.password = hashPswrd;
    update.password_changed_at = Date.now();
    this.setUpdate(update);
  }
};
export const createPasswordReset = async function (
  this: HydratedDocument<IUser>,
) {
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  // OTP
  this.password_reset_otp = crypto.createHash("sha256").update(otp).digest("hex");

  // OTP
  this.password_reset_expires = Date.now() + 10 * 60 * 1000;

  return otp;
};

export const changePasswordAfter = function (
  this: HydratedDocument<IUser>,
  JWTTimestamp: number,
) {
  if (this.password_changedAt) {
    // const changedTimestamp = passwordChangedAt.getTime() / 1000;

    return JWTTimestamp < this.passwordChangedAt / 1000;
  }

  // False means NOT changed
  return false;
};

/** Compare Password */
/** Compare Plain Password With User Hashed Password
 * @returns true - false
 */
export const comparePassword = async function (
  this: HydratedDocument<IUser>,
  password: string,
) {
  return await Bun.password.verify(password, this.password);
};
