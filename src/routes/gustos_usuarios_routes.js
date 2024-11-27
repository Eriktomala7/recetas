import { Router } from "express";
import { guardarGusto, obtenerGustos } from "../controladores/gustos_usuariosctrl.js";

const router = Router();

router.post("/gustos", guardarGusto);
router.get("/gustos/:usuario_id", obtenerGustos);


export default router; 
