const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Karaoke Pro AI",
      version: "1.0.0",
      description: "Backend integral para procesamiento de audio (Spleeter) y gestión de usuarios.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor local",
      },
    ],
    paths: {
      // --- RUTA SPLEETER (AUDIO) ---
      "/api/spleeter/separate": {
        post: {
          summary: "Separar audio en Voces y Acompañamiento",
          tags: ["Audio AI"],
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    audio: { type: "string", format: "binary" }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "Archivos MP3 generados con éxito" },
            500: { description: "Error en el procesamiento de audio" }
          }
        }
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
                        rol: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
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
                    rol: { type: "string" }
                  },
                  example: {
                    nombre: "Kevin",
                    apellidos: "Gomez",
                    correo: "kevin@test.com",
                    contrasena: "123456",
                    rol: "usuario"
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "Usuario registrado exitosamente" },
            500: { description: "Error al registrar usuario" }
          }
        }
      },

      // --- RUTA DE LOGIN ---
      "/usuarios/login": {
        post: {
          summary: "Iniciar Sesión (Login)",
          tags: ["Usuarios"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["correo", "contrasena"],
                  properties: {
                    correo: { type: "string", example: "kevin@test.com" },
                    contrasena: { type: "string", example: "123456" }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "Login exitoso" },
            401: { description: "Credenciales incorrectas" },
            404: { description: "Usuario no encontrado" }
          }
        }
      }
    },
  },
  apis: [], // Mantenemos vacío para evitar errores de parseo YAML en rutas modulares
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;