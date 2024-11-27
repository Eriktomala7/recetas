import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { conmysql } from "../db.js"; // Asegúrate de que la conexión a la base de datos esté configurada
import { getUserByEmail } from "../controladores/usuariosctrl.js";// Importar el método para obtener el usuario por email
