import e from "express";
import { conmysql } from "../db.js";

export const geting = async (req, res) => {
    try {
        const [result] = await conmysql.query("SELECT * FROM ingredientes");
        res.json(result);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener clientes" });
    }
};

export const getingid = async (req, res) => {
    try {
        const [result] = await conmysql.query("SELECT * FROM `ingredientes` WHERE=?", [req.params.id]);
        if (result.length === 0) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        res.json(result[0]);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener el cliente" });
    }
};
// Agregar un nuevo ingrediente
export const addIngrediente = async (req, res) => {
    const { nombre_ingrediente } = req.body;

    if (!nombre_ingrediente) {
        return res.status(400).json({ message: "El nombre del ingrediente es requerido" });
    }

    try {
        const [result] = await conmysql.query("INSERT INTO ingredientes (nombre_ingrediente) VALUES (?)", [nombre_ingrediente]);
        res.status(201).json({ message: "Ingrediente agregado correctamente", ingredienteId: result.insertId });
    } catch (error) {
        return res.status(500).json({ message: "Error al agregar el ingrediente" });
    }
};
// Obtener ingredientes faltantes para una receta
export const getIngredientesFaltantes = async (req, res) => {
    const recetaId = req.query.recetaId;
    const ingredientesUsuario = req.query.ingredientesUsuario.split(','); // Ingredientes que el usuario tiene
    const query = `
        SELECT i.nombre_ingrediente
        FROM receta_ingredientes ri
        JOIN ingredientes i ON ri.ingrediente_id = i.id
        WHERE ri.receta_id = ? AND i.nombre_ingrediente NOT IN (?)
    `;
    try {
        const [result] = await conmysql.query(query, [recetaId, ingredientesUsuario]);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener ingredientes faltantes', error });
    }
};
export const getRecetasPorIngredientes = async (req, res) => {
  const ingredientes = req.query.ingredientes;

  if (!ingredientes || ingredientes.trim() === '') {
    return res.status(400).json({
      message: 'El parámetro ingredientes es requerido y no puede estar vacío.',
    });
  }

  const ingredientesArray = ingredientes.split(',');
  const query = `
      SELECT r.nombre_receta, r.tiempo_preparacion, r.nivel_dificultad
      FROM recetas r
      JOIN receta_ingredientes ri ON r.id = ri.receta_id
      JOIN ingredientes i ON ri.ingrediente_id = i.id
      WHERE i.nombre_ingrediente IN (?)
  `;
  try {
    const [result] = await conmysql.query(query, [ingredientesArray]);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener recetas por ingredientes',
      error: error.message,
    });
  }
};


