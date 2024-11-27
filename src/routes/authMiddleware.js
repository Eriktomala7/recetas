import jwt from "jsonwebtoken";

// Middleware para verificar el JWT
export const authMiddleware = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(403).json({ message: "No se proporcionó token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.userId = decoded.userId; // Puedes agregar más datos al token si lo deseas
        next(); // Continuar con la siguiente función
    } catch (error) {
        return res.status(401).json({ message: "Token no válido" });
    }
};
