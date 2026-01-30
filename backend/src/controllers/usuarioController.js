const pool = require("../../db"); // Ajusta la ruta según tu estructura de carpetas
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

// Configuración de Google
const GOOGLE_CLIENT_ID = "262428448408-i48oqhsei1hth1dgdrh2p6gu9u93fgid.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Helper para generar token local
const generarToken = (user) => {
  const tokenPayload = {
    nombre: user.nombre,
    apellido: user.apellidos,
    correo: user.correo,
    rol: user.rol
  };
  return jwt.sign(
    tokenPayload, 
    process.env.JWT_SECRET || 'secreto_super_seguro', 
    { expiresIn: '2h' }
  );
};

// Obtener todos los usuarios
const obtenerUsuarios = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM usuarios");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor al obtener usuarios");
  }
};

// Obtener perfil (protegido)
const obtenerPerfil = (req, res) => {
  res.json({
    mensaje: "Token válido",
    datosUsuario: req.usuario
  });
};

// Crear usuario (Registro)
const crearUsuario = async (req, res) => {
  try {
    const { nombre, apellidos, correo, contrasena, rol } = req.body;
    
    // Validaciones básicas
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
};

// Login Normal
const loginUsuario = async (req, res) => {
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

    const token = generarToken(user);

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
};

// Login con Google
const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    // 1. Verificar el token con Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    
    // 2. Extraer datos
    const { email, given_name, family_name } = ticket.getPayload();

    // 3. Verificar o crear usuario
    const userExist = await pool.query("SELECT * FROM usuarios WHERE correo = $1", [email]);
    let user;

    if (userExist.rows.length > 0) {
      user = userExist.rows[0];
    } else {
      const dummyPassword = Math.random().toString(36).slice(-8) + "Goog!";
      const newUser = await pool.query(
        "INSERT INTO usuarios (nombre, apellidos, correo, contrasena, rol) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [given_name || "Usuario", family_name || "Google", email, dummyPassword, 'usuario']
      );
      user = newUser.rows[0];
    }

    // 4. Generar token propio
    const appToken = generarToken(user);

    res.json({
      message: "Login Google exitoso",
      token: appToken,
      usuario: { id: user.id, nombre: user.nombre, rol: user.rol }
    });

  } catch (err) {
    console.error("Error Google Login:", err);
    res.status(401).json({ message: "Token de Google inválido" });
  }
};

module.exports = {
  obtenerUsuarios,
  obtenerPerfil,
  crearUsuario,
  loginUsuario,
  googleLogin
};