import { Router } from "express";
import { upload } from "../middleware/upload";
import { uploadFile, uploadFiles } from "../lib/supabase";

const router = Router();

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const url = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    res.json({
      url,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/upload/multiple", upload.array("files", 10), async (req, res) => {
  try {
    const files = (req.files as Express.Multer.File[]) || [];
    const results = await uploadFiles(
      files.map((f) => ({ buffer: f.buffer, originalname: f.originalname, mimetype: f.mimetype }))
    );
    res.json({ files: results });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
