import type { Types } from "mongoose";

export type Ref<T> = Types.ObjectId | T;

export interface ITimestamps {
  created_at: Date;
  updated_at: Date;
}
