import type { EUserStatus } from "@/enum";
import type { IUser } from "./user.type";
import type { ITimestamps, Ref } from "./common.type";

/**
 * @interface IBusiness
 * Represents a business document in MongoDB
 * 
 * @property {string} [name] - Name of the business
 * @property {string} industry - Industry type (required)
 * @property {string} [address] - Street address
 * @property {string} [city] - City name
 * @property {string} [state] - State name
 * @property {string} [zip_code] - Postal code
 * @property {string} status - Status of business (active/inactive)
 * @property {number} sms_usage - Number of SMS used
 * @property {string} [image] - Image URL
 * @property {string[]} facebook_url - Array of Facebook URLs
 * @property {string} [description] - Description of the business
 * @property {string} [business_type] - Type of business
 * @property {string} [operating_hours] - Operating hours
 * @property {string} [phone] - Phone number (forbidden in API)
 * @property {string} [preferred_channel] - Preferred communication channel
 * @property {string} [notification_channel] - Notification channel
 * @property {string} [whatsapp] - WhatsApp number
 * @property {string} [license_number] - License number
 * @property {Date} [deleted_at] - Soft delete timestamp
 * @extends ITimestamps for created_at and updated_at properties
 */
export interface IBusiness extends ITimestamps {
  name?: string;
  industry: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  user: Ref<IUser>;
  status: EUserStatus;
  sms_usage: number;
  image?: string;
  facebook_url: string[];
  description?: string;
  business_type?: string;
  operating_hours?: string;
  phone?: string;
  preferred_channel?: string;
  notification_channel?: string;
  whatsapp?: string;
  license_number?: string;
  deleted_at?: Date | null;
}

