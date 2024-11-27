import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { conmysql } from "../db.js";

const router = Router();

// Ruta para login (autenticación)
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Correo electrónico y contraseña son requeridos' });
    }

    try {
        // Verificar si el usuario existe
        const [rows] = await conmysql.query('SELECT * FROM usuarios WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        const user = rows[0];

        // Verificar si la contraseña es correcta
        const isMatch = await bcrypt.compare(password, user.contrasena_hash);

        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        // Crear un JWT
        const token = jwt.sign(
            { id: user.usuario_id, email: user.email, perfil_id: user.perfil_id }, // Incluye perfil_id en el token
            'tu_secreto',
            { expiresIn: '1h' }
        );

        // Enviar perfil_id en la respuesta para redirección en el frontend
        return res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token,
            perfil_id: user.perfil_id,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el inicio de sesión', error: error.message });
    }
});

export default router;
