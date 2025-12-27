import { Router } from "express";
import {
  createBusinessIndustry,
  getBusinessIndustry,
  getBusinessIndustries,
  deleteBusinessIndustry,
  updateBusinessIndustry,
} from "@/handler";
import { protect, restrictTo } from "@/middleware/express";

const router = Router();

router
  .route("/")
  .post(
    // protect,
    // restrictTo('super_admin', 'business_admin'),
    createBusinessIndustry,
  )
  .get(
    // protect,
    // restrictTo('super_admin', 'business_admin'),
    getBusinessIndustries,
  );

router
  .route("/:id")
  .get(
    // protect,
    // restrictTo('super_admin', 'business_admin'),
    getBusinessIndustry,
  )
  .patch(
    // protect,
    // restrictTo('super_admin', 'business_admin'),
    updateBusinessIndustry,
  )
  .delete(
    // protect,
    // restrictTo('super_admin'),
    deleteBusinessIndustry,
  );

export { router as businessIndustryRouter };
