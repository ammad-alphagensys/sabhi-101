import { Router } from "express";
import {
  createBusiness,
  getBusiness,
  getBusinesses,
  deleteBusiness,
  updateBusiness,
} from "@/handler";
import { multerToBody, protect, restrictTo } from "@/middleware/express";
import { mediaUpload } from "@/library/utils";

const router = Router();

router
  .route("/")
  .post(
    // protect,
    // restrictTo('super_admin', 'business_admin'),
    mediaUpload.single("image"),
    multerToBody,
    createBusiness,
  )
  .get(
    // protect,
    // restrictTo('super_admin', 'business_admin'),
    getBusinesses,
  );

router
  .route("/:id")
  .get(
    // protect,
    // restrictTo('super_admin', 'business_admin'),
    getBusiness,
  )
  .patch(
    // protect,
    // restrictTo('super_admin', 'business_admin'),

    mediaUpload.single("image"),
    multerToBody,
    updateBusiness,
  )
  .delete(
    // protect,
    // restrictTo('super_admin'),
    deleteBusiness,
  );

export { router as businessRouter };
