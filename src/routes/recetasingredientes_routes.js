import { Router } from "express";
//exporta de recetasctrls.js
import {getIngredientesDeReceta,addIngredienteAReceta,getRecetasPorIngredientes } from "../controladores/recetasingredientectrl.js";

const router = Router();
router.get("/recetas/:id", getIngredientesDeReceta);
router.post("/recetas/:id", addIngredienteAReceta);
router.get("/recetas/ingredientes", getRecetasPorIngredientes);







export default router; 