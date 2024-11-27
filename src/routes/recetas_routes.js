import { Router } from "express";
// Middleware de autenticación (comentado porque no se usa actualmente)
import { authMiddleware } from "../routes/authMiddleware.js";
import { upload } from '../middlewares/upload.js'; 

// Controladores de recetas
import { 
    getRecetas, 
    addReceta, 
    getRecetasPorIngredientes, 
    getRecetasPorFiltro, 
    addIngredienteAReceta, 
    updateReceta, 
    deleteReceta ,
    subirImagenReceta,getIngredientesDeReceta
} from "../controladores/recetasctrl.js";

const router = Router();

// Rutas para las recetas
router.get("/recetas", getRecetas); // Obtener todas las recetas
router.post("/recetas", upload.single('imagen'),addReceta); // Agregar una nueva receta
router.get("/recetas/ingredientes", getRecetasPorIngredientes); // Obtener recetas por ingredientes
router.get("/recetas/filtro", getRecetasPorFiltro); // Obtener recetas por filtro
router.post('/recetas/ingredientes', addIngredienteAReceta); // Agregar ingrediente a una receta
router.put('/recetas/:receta_id',upload.single('imagen'), updateReceta); // Actualizar una receta
router.delete('/recetas/:receta_id', deleteReceta); // Eliminar una receta
router.get('/recetas/:receta_id/ingredientes', getIngredientesDeReceta); // Obtener ingredientes de una receta
// Ruta para subir la imagen de una receta
router.post('/recetas/:receta_id/subir', upload.single('imagen'), subirImagenReceta); // Subir una imagen a una receta

export default router;

