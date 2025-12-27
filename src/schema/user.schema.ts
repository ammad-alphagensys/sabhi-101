
import { Schema } from "mongoose";
import { changePasswordAfter, comparePassword, hashPasswordBeforeSave, hashPasswordBeforeUpdate } from "@/middleware/mongo";
import { EModalNames, EUserRole, EUserStatus } from "@/enum";
import type { IUser, IUserMethods, UserModel } from "@/type";

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    full_name: { type: String, trim: true },
    email: { type: String, trim: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    phone_number: { type: String, trim: true },
    role: { type: String, enum: Object.values(EUserRole), required: true },
    status: { type: Number, enum: Object.values(EUserStatus).filter(e => typeof e === 'number') as number[], default: EUserStatus.ACTIVE },
    image: { type: String },
    password_changed_at: { type: Number },
    business_type: { type: String, trim: true },
    industry: { type: String, trim: true },
    business: { type: Schema.Types.ObjectId, ref: EModalNames.BUSINESS },
    mfa_enabled: { type: Boolean, default: false },
    facebook_url: { type: String, trim: true },
    additional_information: { type: String, trim: true },
    assigned_clerk: { type: Schema.Types.ObjectId, ref: EModalNames.USER },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
    collection: EModalNames.USER,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_, ret: Record<string, any>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// userSchema.virtual('added_templates', {
//   ref: EModalNames.BUSINESS_TEMPLATE,
//   localField: '_id',
//   foreignField: 'added_by'
// });

// Hooks
userSchema.pre("save", hashPasswordBeforeSave);
userSchema.pre("findOneAndUpdate", hashPasswordBeforeUpdate);
userSchema.pre("updateOne", hashPasswordBeforeUpdate);
userSchema.pre("updateMany", hashPasswordBeforeUpdate);

// Methods
userSchema.method("comparePassword", comparePassword);
userSchema.method("changePasswordAfter", changePasswordAfter);

export { userSchema };

