import express from "express";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.post("/", upload.single("image"), (req, res) => {
  console.log("Archivo recibido:", req.file);
  if (!req.file) {
    return res.status(400).json({ message: "No se subió ningún archivo." });
  }
  res.status(200).json({
    message: "Imagen subida exitosamente.",
    filePath: `/uploads/${req.file.filename}`,
  });
});

export default router;
