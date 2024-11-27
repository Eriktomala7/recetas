import e from "express";
import { conmysql } from "../db.js";

export const guardarGusto = async (req, res) => {
    try {
        const { usuario_id, receta_id, calificacion } = req.body;

        const [result] = await conmysql.query(
            "INSERT INTO gustos_usuario (usuario_id, receta_id, calificacion) VALUES (?, ?, ?)",
            [usuario_id, receta_id, calificacion]
        );

        res.status(201).json({ 
            message: "Gusto guardado con éxito", 
            gusto_id: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error al guardar el gusto", 
            error 
        });
    }
};

export const obtenerGustos = async (req, res) => {
    const { usuario_id } = req.params;

    try {
        const [result] = await conmysql.query(
            "SELECT * FROM gustos_usuario WHERE usuario_id = ?", 
            [usuario_id]
        );
        res.json(result);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener los gustos", error });
    }
};
