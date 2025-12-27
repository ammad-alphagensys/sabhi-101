import { type Request } from "express";
import { S3Client, type S3ClientConfig } from "@aws-sdk/client-s3";
import path from "path";
import multerS3 from "multer-s3";

import multer from "multer";
import { Constant } from "@/constant";

function createS3Client() {
  const { s3 } = Constant.instance;

  return new S3Client({
    region: s3.region,
    credentials: {
      accessKeyId: s3.accessKey!,
      secretAccessKey: s3.secretKey!,
    },
  });
}
//
// /*  INFO: CONFIGURING_AWS.S3_CLIENT */
// const s3config: S3ClientConfig = {
//   region: Constant.instance.s3.region,
//   credentials: {
//     accessKeyId: Constant.instance.s3.accessKey!,
//     secretAccessKey: Constant.instance.s3.secretKey!,
//   },
// };
// const s3 = new S3Client(s3config);

/*
 *  INFO:  MULTER - Middleware Configuration For Uploading Files To AWS S3.
 *
 * This configuration sets up Multer to upload files to an AWS S3 bucket
 * configured with credentials and settings from the application's constants.
 * It uses the multer-s3 storage engine to handle file uploads directly to S3.
 */
export const s3upload = multer({
  storage: multerS3({
    s3: createS3Client(),
    // acl: "public-read",
    bucket: Constant.instance.s3.bucket!,
    contentType: multerS3.AUTO_CONTENT_TYPE,

    key: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: any, key?: string | undefined) => void,
    ) => {
      req.body.s3 = Constant.instance.s3; /*  INFO: ATTACH_S3_CONFIGURATION_TO_THE_REQUEST_BODY */
      req.body.file = file; /*  INFO: ATTACH_FILE_DETAILS_TO_THE_REQUEST_BODY */
      /*  INFO: GENERATE_A_UNIQUE_KEY_FOR_THE_UPLOADED_FILE */
      const fileName = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
      cb(null, `${fileName}${path.extname(file.originalname)}`);
    },
  }),
});
