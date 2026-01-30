const express = require("express");
const router = express.Router();
const pool = require("../../db");
const jwt = require("jsonwebtoken"); // <--- IMPORTANTE: Importar JWT
const { OAuth2Client } = require("google-auth-library"); // <--- NUEVO: Para verificar token de Google

// NOTA: Deberías poner este ID en tu archivo .env
const GOOGLE_CLIENT_ID = "262428448408-i48oqhsei1hth1dgdrh2p6gu9u93fgid.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// --- MIDDLEWARE DE VERIFICACIÓN DE TOKEN ---
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

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Endpoints para gestión de usuarios
 */

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crear un usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               correo:
 *                 type: string
 *               contrasena:
 *                 type: string
 *               rol:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario creado exitosamente
 */

/**
 * @swagger
 * /usuarios/login:
 *   post:
 *     summary: Login de usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correo:
 *                 type: string
 *               contrasena:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 */

/**
 * @swagger
 * /usuarios/google-login:
 *   post:
 *     summary: Login con Google
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login Google exitoso
 */

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

// --- RUTA: PERFIL DE USUARIO ---
router.get("/perfil", verificarToken, (req, res) => {
  res.json({
    mensaje: "Token válido",
    datosUsuario: req.usuario
  });
});

// --- RUTA: CREAR UN USUARIO ---
router.post("/", async (req, res) => {
  try {
    const { nombre, apellidos, correo, contrasena, rol } = req.body;
    
    // Validaciones
    if (!nombre || !apellidos || !correo || !contrasena) {
      return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }
    if (nombre.trim() === "" || apellidos.trim() === "") {
       return res.status(400).json({ message: "Nombre y apellidos no pueden estar vacíos." });
    }
    if (contrasena.length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({ message: "El formato del correo electrónico no es válido." });
    }

    const userExist = await pool.query("SELECT * FROM usuarios WHERE correo = $1", [correo]);
    if (userExist.rows.length > 0) {
      return res.status(409).json({ message: "Este correo ya está registrado." });
    }

    const newUser = await pool.query(
      "INSERT INTO usuarios (nombre, apellidos, correo, contrasena, rol) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nombre.trim(), apellidos.trim(), correo.trim().toLowerCase(), contrasena, rol || 'usuario']
    );

    res.json({ message: "Usuario creado exitosamente", user: newUser.rows[0] });

  } catch (err) {
    console.error("Error al guardar usuario:", err.message);
    res.status(500).send("Error interno del servidor");
  }
});

// --- RUTA: LOGIN NORMAL ---
router.post("/login", async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
        return res.status(400).json({ message: "Correo y contraseña requeridos" });
    }

    const result = await pool.query("SELECT * FROM usuarios WHERE correo = $1", [correo]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    if (user.contrasena !== contrasena) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const tokenPayload = {
        nombre: user.nombre,
        apellido: user.apellidos,
        correo: user.correo,
        rol: user.rol
    };

    const token = jwt.sign(
        tokenPayload, 
        process.env.JWT_SECRET || 'secreto_super_seguro', 
        { expiresIn: '2h' }
    );

    res.json({
      message: "Login exitoso",
      token: token, 
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

// --- RUTA: LOGIN CON GOOGLE (NUEVO) ---
router.post("/google-login", async (req, res) => {
  const { token } = req.body;

  try {
    // 1. Verificar el token con Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    
    // 2. Extraer datos de Google (nombre, apellido, correo)
    const { email, given_name, family_name } = ticket.getPayload();

    // 3. Verificar si existe en la BD
    const userExist = await pool.query("SELECT * FROM usuarios WHERE correo = $1", [email]);
    let user;

    if (userExist.rows.length > 0) {
      // A) Ya existe -> Lo usamos
      user = userExist.rows[0];
    } else {
      // B) No existe -> Lo registramos
      const dummyPassword = Math.random().toString(36).slice(-8) + "Goog!"; // Contraseña dummy
      const newUser = await pool.query(
        "INSERT INTO usuarios (nombre, apellidos, correo, contrasena, rol) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [
          given_name || "Usuario", 
          family_name || "Google", 
          email, 
          dummyPassword, 
          'usuario'
        ]
      );
      user = newUser.rows[0];
    }

    // 4. Generar NUESTRO token JWT
    const tokenPayload = {
        nombre: user.nombre,
        apellido: user.apellidos,
        correo: user.correo,
        rol: user.rol
    };

    const appToken = jwt.sign(
        tokenPayload, 
        process.env.JWT_SECRET || 'secreto_super_seguro', 
        { expiresIn: '2h' }
    );

    res.json({
      message: "Login Google exitoso",
      token: appToken,
      usuario: { id: user.id, nombre: user.nombre, rol: user.rol }
    });

  } catch (err) {
    console.error("Error Google Login:", err);
    res.status(401).json({ message: "Token de Google inválido" });
  }
});

module.exports = router;