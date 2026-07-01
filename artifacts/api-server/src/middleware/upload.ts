import multer from "multer";

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = /\.(jpg|jpeg|png|gif|webp|mp4|mp3|ogg|wav|pdf|zip|doc|docx|txt|csv)$/i;
  if (allowed.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"));
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});
