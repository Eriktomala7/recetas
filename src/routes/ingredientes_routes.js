import { Router } from "express";
import { geting, getingid , addIngrediente, getIngredientesFaltantes } from "../controladores/ingredientesctrl.js";

const router = Router();

// Armar nuestras rutas
router.get("/ingredientes", geting);
router.get("/ingredientes/:id", getingid);
router.post("/ingredientes", addIngrediente);
router.get("/ingredientes/faltantes", getIngredientesFaltantes);


export default router; 
