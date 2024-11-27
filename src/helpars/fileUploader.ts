import multer from "multer";
import path from "path";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
import { ICloudinaryResponse, IFile } from "../interfaces/file";
import config from "../config";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// upload single image
const uploadSingle = upload.single("carImage");

// upload multiple image
const uploadPost = upload.fields([
  { name: "photos", maxCount: 500 },
  { name: "videos", maxCount: 100 },
 
]);

cloudinary.config({ 
  cloud_name: 'dezfej6wq', 
  api_key: config.cloudinary.api_key, 
  api_secret:config.cloudinary.api_secret  // Click 'View API Keys' above to copy your API secret
});
const uploadToCloudinary = async (file: Express.Multer.File): Promise<any> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file.path,
      { resource_type: 'auto' }, // Auto-detect file type
      (error, result) => {
        // Delete the local file after uploading
        fs.unlinkSync(file.path);

        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
};

export const fileUploader = {
  upload,
  uploadSingle,
  uploadPost,
  uploadToCloudinary

};
