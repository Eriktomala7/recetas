import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Importar rutas
import usuarios from "./routes/usuarios.js";
import recetasRoutes from "./routes/recetas_routes.js";
import ingredientesRoutes from "./routes/ingredientes_routes.js";
import recetasIngredientesRoutes from "./routes/recetasingredientes_routes.js";
import usuarioIngredienteRoutes from "./routes/usuarioingrediente_routes.js";
import gustosUsuariosRoutes from "./routes/gustos_usuarios_routes.js";
import authRoutes from "./routes/auth.js";
import imageRoutes from "./routes/imageroutes.js";

// Configuración de __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear la instancia de la aplicación
const app = express();

// Configuración de middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Servir archivos estáticos desde la carpeta 'uploads'

// Configuración CORS
app.use(cors());

app.use(express.json());  // Parsear JSON en las solicitudes

// Registrar rutas
app.use("/api/auth", authRoutes);
app.use("/api", usuarios);
app.use("/api", recetasRoutes);
app.use("/api", ingredientesRoutes);
app.use("/api", recetasIngredientesRoutes);
app.use("/api", usuarioIngredienteRoutes);
app.use("/api", gustosUsuariosRoutes);
app.use("/api/imagenes", imageRoutes);  // Ruta para subir imágenes

// Middleware para manejar rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ message: "Página no encontrada" });
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Ocurrió un error interno en el servidor." });
});

// Exportar la aplicación
export default app;
