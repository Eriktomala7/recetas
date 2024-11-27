import { Router } from "express";
//exporta de recetasctrls.js
import { getIngredientesDeUsuario,addIngredienteAUsuario } from "../controladores/usuarioingredientectrl.js";

const router = Router();
// Rutas de ingredientes del usuario
router.get("/usuarios/:id/ingredientes", getIngredientesDeUsuario);  // Obtener ingredientes del usuario
router.post("/usuarios/:id/ingredientes", addIngredienteAUsuario);




export default router;
 