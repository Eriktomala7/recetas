import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Configurar __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verificar y crear la carpeta 'uploads' si no existe
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Carpeta de destino para los archivos subidos
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now(); // Añadir marca de tiempo
    const randomSuffix = Math.round(Math.random() * 1e9); // Evitar conflictos
    const safeFileName = file.originalname.replace(/\s+/g, '-'); // Reemplazar espacios por guiones
    cb(null, `${timestamp}-${randomSuffix}-${safeFileName}`);
  }
});

// Filtro para validar el tipo de archivo permitido
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/; // Tipos permitidos
  const isMimeType = allowedTypes.test(file.mimetype);
  const isExtName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (isMimeType && isExtName) {
    cb(null, true); // Aceptar archivo
  } else {
    cb(new Error('Solo se permiten imágenes en formato JPEG, JPG o PNG.'), false); // Rechazar archivo
  }
};

// Crear middleware de multer con configuración
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // Límite de tamaño: 2 MB
});

// Exportar middleware
export { upload };
