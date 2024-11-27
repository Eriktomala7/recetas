// usuarioIngredienteController.js
import { conmysql } from "../db.js";

// Obtener los ingredientes de un usuario
export const getIngredientesDeUsuario = async (req, res) => {
    const { usuario_id } = req.params;

    try {
        const [result] = await conmysql.query(`
            SELECT i.nombre_ingrediente, ui.cantidad 
            FROM usuario_ingredientes ui
            JOIN ingredientes i ON ui.ingrediente_id = i.ingrediente_id
            WHERE ui.usuario_id = ?`, [usuario_id]);

        if (result.length === 0) {
            return res.status(404).json({ message: "No se encontraron ingredientes para este usuario" });
        }

        res.json(result);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener los ingredientes del usuario" });
    }
};

// Agregar ingredientes a un usuario
export const addIngredienteAUsuario = async (req, res) => {
    const { usuario_id, ingrediente_id, cantidad } = req.body;

    if (!usuario_id || !ingrediente_id || !cantidad) {
        return res.status(400).json({ message: "Usuario, ingrediente y cantidad son requeridos" });
    }

    try {
        const [result] = await conmysql.query(`
            INSERT INTO usuario_ingredientes (usuario_id, ingrediente_id, cantidad) 
            VALUES (?, ?, ?)`, [usuario_id, ingrediente_id, cantidad]);

        res.status(201).json({ message: "Ingrediente agregado al usuario correctamente", usuarioIngredienteId: result.insertId });
    } catch (error) {
        return res.status(500).json({ message: "Error al agregar el ingrediente al usuario" });
    }
};
