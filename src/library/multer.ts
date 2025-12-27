import multer from "multer";
import path from "path";

/**
 * Configures Multer middleware for handling file uploads.
 *
 * This configuration sets up Multer to store uploaded files to the "public" directory,
 * assigning each file a unique filename composed of its original name, a timestamp,
 * and a random number suffix.
 *
 * @remarks
 * Multer is configured with a disk storage engine using `multer.diskStorage`, which
 * specifies the destination directory and filename for each uploaded file.
 *
 * @returns Multer middleware configured to handle file uploads according to the specified settings.
 */
const storage = multer.diskStorage({
  destination: function (_, __, cb) {
    cb(null, "public/images/");
  },
  filename: function (_, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

export const multerUpload = multer({ storage });
