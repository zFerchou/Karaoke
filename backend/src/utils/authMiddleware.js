const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verificarToken } = require("../utils/authMiddleware");

/**
 * @swagger
 * tags:
 * name: Usuarios
 * description: Endpoints para gestión de usuarios
 */

/**
 * @swagger
 * /usuarios:
 * get:
 * summary: Obtener todos los usuarios
 * tags: [Usuarios]
 * responses:
 * 200:
 * description: Lista de usuarios
 */
router.get("/", userController.obtenerUsuarios);

/**
 * @swagger
 * /usuarios/perfil:
 * get:
 * summary: Obtener perfil del usuario autenticado
 * tags: [Usuarios]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Datos del perfil
 */
router.get("/perfil", verificarToken, userController.obtenerPerfil);

/**
 * @swagger
 * /usuarios:
 * post:
 * summary: Crear un usuario
 * tags: [Usuarios]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * nombre: { type: string }
 * apellidos: { type: string }
 * correo: { type: string }
 * contrasena: { type: string }
 * rol: { type: string }
 * responses:
 * 200:
 * description: Usuario creado exitosamente
 */
router.post("/", userController.crearUsuario);

/**
 * @swagger
 * /usuarios/login:
 * post:
 * summary: Login de usuario
 * tags: [Usuarios]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * correo: { type: string }
 * contrasena: { type: string }
 * responses:
 * 200:
 * description: Login exitoso
 */
router.post("/login", userController.loginUsuario);

/**
 * @swagger
 * /usuarios/google-login:
 * post:
 * summary: Login con Google
 * tags: [Usuarios]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * token: { type: string }
 * responses:
 * 200:
 * description: Login Google exitoso
 */
router.post("/google-login", userController.googleLogin);

module.exports = router;