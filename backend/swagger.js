const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Karaoke Pro",
      version: "1.0.0",
      description: "Backend modular con Spleeter, Validaciones y Autenticación JWT",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor Local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    paths: {
      // --- RUTA SPLEETER ---
      "/api/spleeter/separate": {
        post: {
          summary: "Separar audio en Voces y Acompañamiento",
          tags: ["Spleeter"],
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    audio: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Separación completada con éxito. Archivos MP3 generados." },
            500: { description: "Error en el procesamiento del audio." },
          },
        },
      },

      // --- RUTAS DE USUARIOS ---
      "/usuarios": {
        get: {
          summary: "Obtener lista de todos los usuarios",
          tags: ["Usuarios"],
          responses: {
            200: {
              description: "Lista de usuarios obtenida",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "integer" },
                        nombre: { type: "string" },
                        correo: { type: "string" },
                        rol: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        
        post: {
          summary: "Registrar un nuevo usuario",
          description: "Crea un usuario validando email y contraseña mínima de 6 caracteres.",
          tags: ["Usuarios"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["nombre", "apellidos", "correo", "contrasena"], 
                  properties: {
                    nombre: { type: "string", minLength: 1 },
                    apellidos: { type: "string", minLength: 1 },
                    correo: { type: "string", format: "email" },
                    contrasena: { type: "string", minLength: 6 },
                    rol: { type: "string", default: "usuario" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Usuario registrado exitosamente" },
            400: { description: "Error de validación" },
            409: { description: "Conflicto: El correo ya está registrado" },
            500: { description: "Error interno del servidor" },
          },
        },
      },

      // --- PERFIL DE USUARIO ---
      "/usuarios/perfil": {
        get: {
          summary: "Obtener perfil (Verificar Token)",
          tags: ["Usuarios"],
          description: "Ruta protegida. Requiere enviar el Token JWT en el Header.",
          security: [
            { bearerAuth: [] },
          ],
          responses: {
            200: {
              description: "Token válido, devuelve datos del usuario",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      mensaje: { type: "string" },
                      datosUsuario: {
                        type: "object",
                        properties: {
                          nombre: { type: "string" },
                          apellido: { type: "string" },
                          correo: { type: "string" },
                          rol: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: "No se envió token" },
            403: { description: "Token inválido o expirado" },
          },
        },
      },

      // --- LOGIN NORMAL ---
      "/usuarios/login": {
        post: {
          summary: "Iniciar Sesión (Obtener Token JWT)",
          tags: ["Usuarios"],
          description: "Verifica credenciales y retorna un Token JWT.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["correo", "contrasena"],
                  properties: {
                    correo: { type: "string", example: "kevin@test.com" },
                    contrasena: { type: "string", example: "123456" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Login exitoso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      token: { type: "string", description: "JWT" },
                      usuario: { type: "object" },
                    },
                  },
                },
              },
            },
            400: { description: "Faltan datos" },
            401: { description: "Credenciales incorrectas" },
            404: { description: "Usuario no encontrado" },
          },
        },
      },

      // --- LOGIN CON GOOGLE (NUEVO) ---
      "/usuarios/google-login": {
        post: {
          summary: "Iniciar Sesión con Google",
          tags: ["Usuarios"],
          description: "Recibe token de Google. Si el usuario no existe, lo registra con nombre y apellido.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["token"],
                  properties: {
                    token: { type: "string", description: "Credential Token de Google" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Login Google exitoso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      token: { type: "string" },
                      usuario: { type: "object" },
                    },
                  },
                },
              },
            },
            401: { description: "Token de Google inválido" },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;