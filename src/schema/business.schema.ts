import { EUserStatus, EModalNames, ECollectionNames } from "@/enum";
import { User } from "@/model";
import type { IBusiness } from "@/type";
import { Schema } from "mongoose";

/**
 * Mongoose schema for the Business model
 */
const schema = new Schema<IBusiness>(
  {
    name: { type: String, default: null },
    industry: { type: String, required: true },
    address: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    zip_code: { type: String, default: null },
    status: {
      type: Number,
      enum: Object.values(EUserStatus).filter(e => typeof e === 'number'),
      default: EUserStatus.ACTIVE,
    },
    sms_usage: { type: Number, default: 0 },
    user: { type: Schema.Types.ObjectId, ref: EModalNames.USER, required: true },
    image: { type: String, default: null },
    facebook_url: { type: [String], default: [] },
    description: { type: String, default: null },
    business_type: { type: String, default: null },
    operating_hours: { type: String, default: null },
    phone: { type: String, default: null },
    preferred_channel: { type: String, default: null },
    notification_channel: { type: String, default: null },
    whatsapp: { type: String, default: null },
    license_number: { type: String, default: null },
    deleted_at: { type: Date, default: null },
  },
  {
    collection: ECollectionNames.BUSINESS,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false, // removes __v
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        delete ret._id; // remove _id from API response
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

schema.pre('deleteOne', async function (this: any) {
  await User.deleteMany({ business: this._id });
});

schema.virtual('templates', {
  ref: 'BusinessTemplate',
  localField: '_id',
  foreignField: 'added_by'
});


schema.virtual('subscriptions', {
  ref: 'BusinessSubscription',
  localField: '_id',
  foreignField: 'business'
});

schema.virtual('sale_clerks', {
  ref: 'User',
  localField: '_id',
  foreignField: 'business',
  where: { role: 'sale_clerk' }
});


schema.virtual('customers', {
  ref: 'User',
  localField: '_id',
  foreignField: 'business',
  where: { role: 'sale_clerk' }
});


schema.virtual('customers_profiles', {
  ref: 'User',
  localField: '_id',
  foreignField: 'business',
  where: { role: 'sale_clerk' }
});


schema.virtual('compliance_status', {
  ref: 'ComplianceStatus',
  localField: '_id',
  foreignField: 'business',
  justOne: true
});

export { schema as businessSchema };
