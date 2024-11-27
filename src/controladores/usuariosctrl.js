import express from "express";
import { conmysql } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // Asegúrate de importar JWT

// Obtener todos los usuarios
export const getuser = async (req, res) => {
    try {
        const [result] = await conmysql.query("SELECT * FROM usuarios");
        res.json(result); // Responde con la lista de usuarios
    } catch (error) {
        res.status(500).json({ message: "Error al obtener usuarios", error: error.message });
    }
};

// Obtener un usuario por su ID
export const getuserid = async (req, res) => {
    try {
        const [result] = await conmysql.query("SELECT * FROM usuarios WHERE usuario_id = ?", [req.params.id]);
        if (result.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.json(result[0]); // Responde con el usuario encontrado
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el usuario", error: error.message });
    }
};

// Crear un nuevo usuario
export const addUser = async (req, res) => {
    const { email, password, nombre_usuario } = req.body;

    // Verificar si faltan campos requeridos
    if (!email || !password || !nombre_usuario) {
        return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    try {
        // Verificar si el email ya está registrado
        const [existingUser] = await conmysql.query("SELECT * FROM usuarios WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "El correo electrónico ya está registrado" });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Asignar el perfil_id 3 para usuarios comunes
        const perfil_id = 3;  // Los nuevos usuarios serán asignados a este perfil por defecto

        // Insertar el nuevo usuario en la base de datos (con perfil_id = 3 por defecto)
        const query = "INSERT INTO usuarios (email, contrasena_hash, nombre_usuario, perfil_id) VALUES (?, ?, ?, ?)";
        await conmysql.query(query, [email, hashedPassword, nombre_usuario, perfil_id]);

        // Responder con éxito
        res.status(201).json({ message: "Usuario creado correctamente" });
    } catch (error) {
        // Capturar errores de la base de datos o cualquier otro error inesperado
        console.error("Error al crear el usuario:", error);
        res.status(500).json({ message: "Error al crear el usuario", error: error.message });
    }
};

// Guardar preferencias del usuario
export const addPreferencias = async (req, res) => {
    const { id } = req.params;
    const { preferencias } = req.body;

    if (!preferencias || !id) {
        return res.status(400).json({ message: "Datos incompletos" });
    }

    try {
        const query = "INSERT INTO preferencias_usuario (usuario_id, preferencias) VALUES (?, ?)";
        await conmysql.query(query, [id, JSON.stringify(preferencias)]);
        res.status(200).json({ message: "Preferencias guardadas correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al guardar preferencias", error: error.message });
    }
};

// Obtener preferencias de un usuario
export const getPreferencias = async (req, res) => {
    const { id } = req.params;

    try {
        const query = "SELECT * FROM preferencias_usuario WHERE usuario_id = ?";
        const [result] = await conmysql.query(query, [id]);

        if (result.length === 0) {
            return res.status(404).json({ message: "Preferencias no encontradas" });
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener preferencias", error: error.message });
    }
};

// Obtener un usuario por su email
export const getUserByEmail = async (email) => {
    try {
        const query = "SELECT * FROM usuarios WHERE email = ?";
        const [user] = await conmysql.query(query, [email]);
        return user[0]; // Devuelve el primer usuario encontrado
    } catch (error) {
        console.error("Error al obtener usuario por email:", error.message);
        throw error;
    }
};

// Inicio de sesión
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email y contraseña son requeridos" });
    }

    try {
        // Buscar usuario por email
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.contrasena_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        // Generar token JWT
        const token = jwt.sign(
            { userId: user.usuario_id, perfilId: user.perfil_id }, // Incluye más datos si es necesario
            process.env.JWT_SECRET_KEY || "default_secret",        // Usa variable de entorno para el secreto
            { expiresIn: "1h" }                                   // Ajusta el tiempo de expiración según sea necesario
        );

        // Responder con éxito
        res.status(200).json({
            message: "Inicio de sesión exitoso",
            token,
            user: {
                usuario_id: user.usuario_id,
                nombre_usuario: user.nombre_usuario,
                email: user.email,
                perfil_id: user.perfil_id,
            },
        });
    } catch (error) {
        console.error("Error en login:", error.message);
        res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};
// Eliminar un usuario por ID
export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
      const [result] = await conmysql.query('DELETE FROM usuarios WHERE usuario_id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
    }
  };
  export const updateUser = async (req, res) => {
    const { id } = req.params; // ID del usuario que se va a actualizar
    const { email, nombre_usuario, password } = req.body; // Datos que se van a actualizar

    // Verificar que se envíen al menos algunos campos para actualizar
    if (!email && !nombre_usuario && !password) {
        return res.status(400).json({ message: "Se requiere al menos un campo para actualizar" });
    }

    try {
        // Buscar el usuario por su ID para asegurarse de que existe
        const [existingUser] = await conmysql.query("SELECT * FROM usuarios WHERE usuario_id = ?", [id]);
        if (existingUser.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Preparar los campos para actualizar
        const fields = [];
        const values = [];

        if (email) {
            fields.push("email = ?");
            values.push(email);
        }
        if (nombre_usuario) {
            fields.push("nombre_usuario = ?");
            values.push(nombre_usuario);
        }
        if (password) {
            // Encriptar la nueva contraseña si se va a actualizar
            const hashedPassword = await bcrypt.hash(password, 10);
            fields.push("contrasena_hash = ?");
            values.push(hashedPassword);
        }

        // Concatenar la consulta SQL
        const query = `UPDATE usuarios SET ${fields.join(", ")} WHERE usuario_id = ?`;
        values.push(id); // Agregar el ID del usuario al final de los valores

        // Ejecutar la consulta
        const [result] = await conmysql.query(query, values);
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "No se pudo actualizar el usuario" });
        }

        // Responder con éxito
        res.status(200).json({ message: "Usuario actualizado exitosamente" });
    } catch (error) {
        console.error("Error al actualizar el usuario:", error);
        res.status(500).json({ message: "Error al actualizar el usuario", error: error.message });
    }
};