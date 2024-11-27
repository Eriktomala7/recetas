import { conmysql } from "../db.js";
import { upload } from '../middlewares/upload.js';

// Obtener todas las recetas
export const getRecetas = async (req, res) => {
    try {
        const [result] = await conmysql.query(
            `SELECT receta_id, nombre_receta, instrucciones, tiempo_preparacion, nivel_dificultad, imagen 
             FROM recetas`
        );

        if (result.length === 0) {
            return res.status(404).json({ message: "No se encontraron recetas" });
        }

        result.forEach(receta => {
            if (receta.imagen) {
                receta.imagen = `${req.protocol}://${req.get("host")}/${receta.imagen}`;
            }
        });

        res.status(200).json(result);
    } catch (error) {
        console.error("Error al obtener las recetas:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Agregar una nueva receta
export const addReceta = async (req, res) => {
    const { nombre_receta, instrucciones, tiempo_preparacion, nivel_dificultad } = req.body;

    if (!nombre_receta || !instrucciones || !tiempo_preparacion || !nivel_dificultad) {
        return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    let imagenPath = null;
    if (req.file) {
        imagenPath = `uploads/${req.file.filename}`;
    }

    try {
        const [result] = await conmysql.query(
            "INSERT INTO recetas (nombre_receta, instrucciones, tiempo_preparacion, nivel_dificultad, imagen) VALUES (?, ?, ?, ?, ?)", 
            [nombre_receta, instrucciones, tiempo_preparacion, nivel_dificultad, imagenPath]
        );
        res.status(201).json({
            message: "Receta creada correctamente",
            recetaId: result.insertId,
            imagen: imagenPath ? `${req.protocol}://${req.get("host")}/${imagenPath}` : null
        });
    } catch (error) {
        console.error("Error al agregar receta:", error);
        res.status(500).json({ message: "Error al crear la receta" });
    }
};

// Obtener recetas por ingredientes
export const getRecetasPorIngredientes = async (req, res) => {
    try {
        const { ingredientes } = req.query;

        if (!ingredientes) {
            return res.status(400).json({ message: "Se deben proporcionar ingredientes." });
        }

        const ingredientesArray = ingredientes.split(',');

        const query = `
            SELECT DISTINCT r.receta_id, r.nombre_receta, r.instrucciones, r.tiempo_preparacion, r.nivel_dificultad
            FROM recetas r
            INNER JOIN receta_ingredientes ri ON r.receta_id = ri.receta_id
            INNER JOIN ingredientes i ON ri.ingrediente_id = i.ingrediente_id
            WHERE i.nombre_ingrediente IN (?)
        `;
        const [rows] = await conmysql.query(query, [ingredientesArray]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "No se encontraron recetas con los ingredientes proporcionados." });
        }

        res.json(rows);
    } catch (error) {
        console.error("Error al obtener recetas por ingredientes:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
export const getIngredientesDeReceta = async (req, res) => {
    const { receta_id } = req.params;

    try {
        // Consulta SQL para obtener los ingredientes asociados a la receta
        const [result] = await conmysql.query(`
            SELECT i.nombre_ingrediente, ri.cantidad 
            FROM receta_ingredientes ri
            JOIN ingredientes i ON ri.ingrediente_id = i.ingrediente_id
            WHERE ri.receta_id = ?`, [receta_id]);

        // Verificar si se encontraron ingredientes
        if (result.length === 0) {
            return res.status(404).json({ message: "No se encontraron ingredientes para esta receta" });
        }

        // Responder con los ingredientes encontrados
        res.json(result);
    } catch (error) {
        // Manejo de errores
        return res.status(500).json({ message: "Error al obtener ingredientes de la receta", error: error.message });
    }
};

// Obtener recetas por filtros (tiempo, dificultad)
export const getRecetasPorFiltro = async (req, res) => {
    const { tiempo, dificultad, tiene_imagen } = req.query;

    let query = `
        SELECT * FROM recetas
        WHERE 1=1
    `;
    let params = [];

    // Filtrar por tiempo de preparación
    if (tiempo && !isNaN(tiempo)) {
        query += " AND tiempo_preparacion <= ?";
        params.push(parseInt(tiempo, 10));
    }

    // Filtrar por nivel de dificultad
    if (dificultad && !isNaN(dificultad)) {
        query += " AND nivel_dificultad = ?";
        params.push(parseInt(dificultad, 10));
    }

    // Filtrar por imagen
    if (tiene_imagen === 'true') {
        query += " AND imagen IS NOT NULL AND imagen != ''";
    } else if (tiene_imagen === 'false') {
        query += " AND (imagen IS NULL OR imagen = '')";
    }

    try {
        const [result] = await conmysql.query(query, params);

        if (result.length === 0) {
            return res.status(404).json({ message: "No se encontraron recetas con los filtros proporcionados." });
        }

        result.forEach(receta => {
            if (receta.imagen) {
                receta.imagen = `${req.protocol}://${req.get("host")}/uploads/${receta.imagen}`;
            }
        });

        res.status(200).json(result);
    } catch (error) {
        console.error("Error al obtener recetas por filtro:", error);
        res.status(500).json({ message: "Error al obtener recetas por filtro" });
    }
};

// Agregar ingrediente a una receta
export const addIngredienteAReceta = async (req, res) => {
    const { receta_id, ingrediente_id, cantidad } = req.body;

    if (!receta_id || !ingrediente_id || !cantidad) {
        return res.status(400).json({ message: "Receta, ingrediente y cantidad son requeridos" });
    }

    try {
        const [result] = await conmysql.query(
            "INSERT INTO receta_ingredientes (receta_id, ingrediente_id, cantidad) VALUES (?, ?, ?)", 
            [receta_id, ingrediente_id, cantidad]
        );
        res.status(201).json({ message: "Ingrediente agregado a la receta correctamente", recetaIngredienteId: result.insertId });
    } catch (error) {
        console.error("Error al agregar ingrediente:", error);
        return res.status(500).json({ message: "Error al agregar el ingrediente" });
    }
};

// Actualizar receta
export const updateReceta = async (req, res) => {
    try {
        const recetaId = req.params.receta_id;
        const { nombre_receta, instrucciones, tiempo_preparacion, nivel_dificultad } = req.body;

        const [recetaExistente] = await conmysql.query(
            "SELECT * FROM recetas WHERE receta_id = ?",
            [recetaId]
        );

        if (recetaExistente.length === 0) {
            return res.status(404).json({ message: "Receta no encontrada" });
        }

        const recetaActualizada = {
            nombre_receta: nombre_receta || recetaExistente[0].nombre_receta,
            instrucciones: instrucciones || recetaExistente[0].instrucciones,
            tiempo_preparacion: tiempo_preparacion || recetaExistente[0].tiempo_preparacion,
            nivel_dificultad: nivel_dificultad || recetaExistente[0].nivel_dificultad,
        };

        const [result] = await conmysql.query(
            "UPDATE recetas SET ? WHERE receta_id = ?",
            [recetaActualizada, recetaId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Receta no encontrada" });
        }

        res.status(200).json({
            message: "Receta actualizada correctamente",
            recetaActualizada,
        });
    } catch (error) {
        console.error("Error al actualizar la receta:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Eliminar receta
export const deleteReceta = async (req, res) => {
    const { receta_id } = req.params;

    try {
        const [result] = await conmysql.query("DELETE FROM recetas WHERE receta_id = ?", [receta_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Receta no encontrada" });
        }

        res.status(200).json({ message: "Receta eliminada correctamente" });
    } catch (error) {
        console.error("Error al eliminar receta:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Subir imagen a receta
export const subirImagenReceta = async (req, res) => {
    try {
        const recetaId = req.params.receta_id;

        if (!req.file) {
            return res.status(400).json({ message: "Debe enviar un archivo de imagen válido" });
        }

        const imagenPath = `uploads/${req.file.filename}`;

        const [result] = await conmysql.query(
            "UPDATE recetas SET imagen = ? WHERE receta_id = ?",
            [imagenPath, recetaId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Receta no encontrada" });
        }

        res.status(200).json({
            message: "Imagen subida correctamente",
            imagen: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
        });
    } catch (error) {
        console.error("Error al subir la imagen:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
