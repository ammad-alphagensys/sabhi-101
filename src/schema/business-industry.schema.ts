import { EModalNames, ECollectionNames } from "@/enum";
import type { IBusinessIndustry } from "@/type";
import { Schema } from "mongoose";

const schema = new Schema<IBusinessIndustry>(
  {
    name: { type: String, required: true, unique: true },
    parent_industry: { type: Schema.Types.ObjectId, ref: EModalNames.BUSINESS_INDUSTRY },
    is_active: { type: Boolean, default: true },
    user: { type: Schema.Types.ObjectId, ref: EModalNames.USER, required: true },
  },
  {
    versionKey: false,
    collection: ECollectionNames.BUSINESS_INDUSTRY,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
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
  },
);

export { schema as businessIndustrySchema };
