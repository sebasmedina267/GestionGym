import multer from "multer";
import path from "path";
import fs from "fs";

/**
 * File Upload System Configuration
 * 
 * Orchestrates the persistent storage of multipart/form-data assets (images/branding).
 * Features:
 * - Automated directory provisioning for uploaded assets.
 * - Deterministic filename generation to prevent collisions.
 * - File size enforcement (5MB limit) for resource optimization.
 * - Disk-based storage strategy for reliability.
 */

// Asset Provisioning: Ensures the target storage directory exists on the filesystem
const uploadDir = path.resolve("public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Storage Strategy Definition
 * Configures the destination path and unique nomenclature for binary assets.
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Unique Suffix: Prevents overwriting files with identical original names
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

/**
 * Upload Middleware Instance
 * Configured with standard limits and the defined storage strategy.
 */
export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maximum allowed payload size: 5MB
});
