import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for palm image uploads
const storage = multer.memoryStorage();

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 1 // Only one file at a time
  }
});

// Middleware to validate hand side parameter
export const validateHandSide = (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
  const { hand_side } = req.body;
  
  if (!hand_side || !['left', 'right'].includes(hand_side)) {
    return res.status(400).json({
      success: false,
      message: 'hand_side is required and must be either "left" or "right"'
    });
  }
  
  next();
};

// Middleware to validate image exists
export const validateImageExists = (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file provided'
    });
  }
  
  next();
};