import { type Request } from "express";
import { catchAsync } from "@/library/catch-async";
import { Constant } from "@/constant";

const getFilePath = (req: Request, path: string) => {

  path = path.replace("public", "static");
  // const absolutePath = `https://....com/${path}`;
  const absolutePath = `${req.protocol}://${req.hostname}:${req.socket.localPort}/${path}`;
  return absolutePath;
};

export const multerToBody = catchAsync(async (req: Request, _, next) => {
  const isRunningProduction = Constant.instance.server.nodeEnv === "production";

  /*  NOTE: if We Have Single File => upload.single() */
  if (req.file) {
    const file: Express.MulterS3.File = req.file as Express.MulterS3.File;
    req.body[file.fieldname] = isRunningProduction ? file.location : getFilePath(req, file.path);
  } else if (req.files instanceof Array && req.files.length > 0) {
    /* If We Got Array Of Images => upload.array() */
    const files = req.files as Express.MulterS3.File[];
    req.body[req.files[0]!.fieldname] = files.map((e: Express.MulterS3.File) =>
      isRunningProduction ? e.location : getFilePath(req, e.path),
    );
  } else if (req.files) {
    /* if We Got Multiple Fields => upload.fields() - */

    /* Extracting Files */
    const files = req.files as {
      [fieldname: string]: Express.MulterS3.File[];
    };

    /* Extracting Keys */
    const fileKeys = Object.keys(files);
    fileKeys.forEach((e) => {
      /* Getting Path */
      const docFile = files[e]!.map((e) => isRunningProduction ? e.location : getFilePath(req, e.path));
      /* Storing filepath in req.body & if we have only 1 file don't store it as array else it would be array */
      docFile.length <= 1
        ? (req.body[e] = docFile[0])
        : (req.body[e] = docFile);
    });
  }
  delete req.body.file;
  delete req.body.files;
  delete req.body.s3;

  next();
});
