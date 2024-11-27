// recetaIngredienteController.js
import { conmysql } from "../db.js";


// Obtener ingredientes de una receta
export const getIngredientesDeReceta = async (req, res) => {
    const { receta_id } = req.params;

    try {
        const [result] = await conmysql.query(`
            SELECT i.nombre_ingrediente, ri.cantidad 
            FROM receta_ingredientes ri
            JOIN ingredientes i ON ri.ingrediente_id = i.ingrediente_id
            WHERE ri.receta_id = ?`, [receta_id]);

        if (result.length === 0) {
            return res.status(404).json({ message: "No se encontraron ingredientes para esta receta" });
        }

        res.json(result);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener ingredientes de la receta" });
    }
};

// Agregar ingrediente a una receta
export const addIngredienteAReceta = async (req, res) => {
    const { receta_id, ingrediente_id, cantidad } = req.body;

    if (!receta_id || !ingrediente_id || !cantidad) {
        return res.status(400).json({ message: "Receta, ingrediente y cantidad son requeridos" });
    }

    try {
        const [result] = await conmysql.query(`
            INSERT INTO receta_ingredientes (receta_id, ingrediente_id, cantidad) 
            VALUES (?, ?, ?)`, [receta_id, ingrediente_id, cantidad]);

        res.status(201).json({ message: "Ingrediente agregado a la receta correctamente", recetaIngredienteId: result.insertId });
    } catch (error) {
        return res.status(500).json({ message: "Error al agregar el ingrediente a la receta" });
    }
};
// Obtener recetas que incluyan ciertos ingredientes
export const getRecetasPorIngredientes = async (req, res) => {
    const { ingredientes } = req.query;

    // Validar que los ingredientes fueron proporcionados
    if (!ingredientes) {
        return res.status(400).json({ error: "Se deben proporcionar ingredientes." });
    }

    // Convertir los ingredientes en un array, separando por coma y eliminando espacios
    const ingredientesArray = ingredientes.split(',').map(i => i.trim());

    // Consulta SQL para obtener las recetas que contienen TODOS los ingredientes especificados
    const query = `
        SELECT DISTINCT r.receta_id, r.nombre_receta, r.instrucciones, r.tiempo_preparacion, r.nivel_dificultad
        FROM recetas r
        INNER JOIN receta_ingredientes ri ON r.receta_id = ri.receta_id
        INNER JOIN ingredientes i ON ri.ingrediente_id = i.ingrediente_id
        WHERE i.nombre_ingrediente IN (?)
        GROUP BY r.receta_id
        HAVING COUNT(DISTINCT i.nombre_ingrediente) = ?
    `;

    try {
        // Ejecutar la consulta con los ingredientes proporcionados
        const [result] = await conmysql.query(query, [ingredientesArray, ingredientesArray.length]);

        // Si no se encuentran recetas, devolver un error 404
        if (result.length === 0) {
            return res.status(404).json({ message: "No se encontraron recetas con los ingredientes proporcionados." });
        }

        // Si se encuentran recetas, devolverlas con un código 200
        res.status(200).json(result);
    } catch (error) {
        // En caso de un error en la consulta, devolver un error 500
        console.error("Error al obtener recetas por ingredientes:", error);
        res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};
