import { config } from "dotenv";
config();

export const BD_HOST = process.env.BD_HOST || "localhost";  // Coloca localhost entre comillas
export const BD_DATABASE = process.env.BD_DATABASE || "proy";  // Coloca proy entre comillas
export const BD_USER = process.env.BD_USER || "root";  // Coloca root entre comillas
export const BD_PASS = process.env.BD_PASS || "";  // Esto está bien, ya que es una cadena vacía
export const BD_PORT = process.env.BD_PORT || 3306;  // Este valor es un número, no necesita comillas
export const PORT = process.env.PORT || 3000;  // Este valor es un número, no necesita comillas
