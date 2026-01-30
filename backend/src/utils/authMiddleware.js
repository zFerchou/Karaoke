const jwt = require("jsonwebtoken");

// Middleware para verificar el token JWT
const verificarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Acceso denegado. No se proporcionó token." });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro', (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido o expirado." });
    }
    req.usuario = user;
    console.log("🔓 Datos del Token verificados:", user);
    next();
  });
};

module.exports = { verificarToken };