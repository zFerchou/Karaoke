const express = require("express");
const router = express.Router();

// AQUÍ ESTÁ EL CAMBIO: Importamos la conexión desde el archivo db.js
// Usamos ".." para salir de la carpeta "routes" y buscar en "backend"
const pool = require("../db"); 

// --- RUTA: OBTENER TODOS LOS USUARIOS ---
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM usuarios");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor al obtener usuarios");
  }
});

// --- RUTA: CREAR UN USUARIO ---
router.post("/", async (req, res) => {
  try {
    const { nombre, apellidos, correo, contrasena, rol } = req.body;
    
    // Query para insertar datos
    const newUser = await pool.query(
      "INSERT INTO usuarios (nombre, apellidos, correo, contrasena, rol) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nombre, apellidos, correo, contrasena, rol]
    );

    res.json(newUser.rows[0]);
  } catch (err) {
    console.error("Error al guardar usuario:", err.message);
    res.status(500).send("Error al crear usuario (verificar consola)");
  }
});

// --- RUTA: INICIO DE SESIÓN (LOGIN) ---
router.post("/login", async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    const result = await pool.query("SELECT * FROM usuarios WHERE correo = $1", [correo]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    if (user.contrasena !== contrasena) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    res.json({
      message: "Login exitoso",
      usuario: {
        id: user.id,
        nombre: user.nombre,
        rol: user.rol
      }
    });

  } catch (err) {
    console.error("Error en login:", err.message);
    res.status(500).send("Error del servidor");
  }
});

module.exports = router;