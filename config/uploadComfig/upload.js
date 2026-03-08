require("dotenv").config();
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("../cloudinaryConfig/cloudinary");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadToCloudinary = async (file) => {
  if (!file) return null;

  return new Promise((resolve, reject) => {
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "miorish",
        public_id: fileName.replace(fileExt, ""),
        resource_type: "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    uploadStream.end(file.buffer);
  });
};

const singleUpload = (fieldName) => [
  upload.single(fieldName),
  async (req, res, next) => {
    try {
      if (req.file) {
        req.fileUrl = await uploadToCloudinary(req.file);
      }
      next();
    } catch (err) {
      next(err);
    }
  },
];

const multipleUpload = (fieldName, maxCount = 5) => [
  upload.array(fieldName, maxCount),
  async (req, res, next) => {
    try {
      if (req.files && req.files.length > 0) {
        req.fileUrls = await Promise.all(
          req.files.map((file) => uploadToCloudinary(file))
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  },
];

const fieldsUpload = (fields) => [
  upload.fields(fields),
  async (req, res, next) => {
    try {
      if (req.files) {
        // req.files is an object: { fieldName: [file1, file2], ... }
        for (const fieldName in req.files) {
          const filesArray = req.files[fieldName];
          req.files[fieldName] = await Promise.all(
            filesArray.map(async (file) => ({
              ...file,
              location: await uploadToCloudinary(file)
            }))
          );
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  },
];

module.exports = { single: singleUpload, array: multipleUpload, fields: fieldsUpload };
