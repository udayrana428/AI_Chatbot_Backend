import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (localFilePath, folder = "Uploads") => {
  try {
    if (!localFilePath) return null;

    // Upload file to cloudinary//
    const response = cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: folder,
    });

    // File has been uploaded successfully
    console.log("File is uploaded on cloudinary ", (await response).url);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.log("Failed to upload to cloudinary ", error);
  }
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

export default uploadOnCloudinary;
