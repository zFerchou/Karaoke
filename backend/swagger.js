const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Karaoke Pro",
      version: "1.0.0",
      description: "Backend modular para procesamiento con Spleeter y Gestión de Usuarios",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor Local",
      },
    ],
    paths: {
      // --- RUTA SPLEETER (Actualizada a la ruta modular de Fernando) ---
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

      // --- RUTAS DE USUARIOS (Conservadas de tu rama HEAD) ---
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
          tags: ["Usuarios"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["nombre", "correo", "contrasena"],
                  properties: {
                    nombre: { type: "string" },
                    apellidos: { type: "string" },
                    correo: { type: "string" },
                    contrasena: { type: "string" },
                    rol: { type: "string" },
                  },
                  example: {
                    nombre: "Kevin",
                    apellidos: "Gomez",
                    correo: "kevin@test.com",
                    contrasena: "123456",
                    rol: "usuario",
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Usuario registrado exitosamente" },
            500: { description: "Error al registrar usuario" },
          },
        },
      },

      // --- RUTA DE INICIO DE SESIÓN (LOGIN) ---
      "/usuarios/login": {
        post: {
          summary: "Iniciar Sesión (Login)",
          tags: ["Usuarios"],
          description: "Verifica correo y contraseña para dar acceso",
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
                      mensaje: { type: "string" },
                      usuario: { type: "object" },
                    },
                  },
                },
              },
            },
            401: { description: "Credenciales incorrectas" },
            404: { description: "Usuario no encontrado" },
          },
        },
      },
    },
  },
  // Dejamos esto vacío ya que definimos las rutas manualmente arriba
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;