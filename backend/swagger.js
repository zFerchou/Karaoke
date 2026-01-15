const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Karaoke Backend",
      version: "1.0.0",
      description: "Backend en Node.js para Spleeter y Gestión de Usuarios",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor local",
      },
    ],
    paths: {
      // --- RUTA SPLEETER (AUDIO) ---
      "/separate": {
        post: {
          summary: "Separar voz y acompañamiento",
          tags: ["Audio"],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    audio: {
                      type: "string",
                      format: "binary",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Separación completada con éxito" },
            500: { description: "Error en el procesamiento" },
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
                },
              },
            },
          },
          responses: {
            200: { description: "Usuario registrado exitosamente" },
            500: { description: "Error al registrar usuario" }
          }
        }
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
                    contrasena: { type: "string", example: "123456" }
                  }
                }
              }
            }
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
                      usuario: { type: "object" }
                    }
                  }
                }
              }
            },
            401: { description: "Credenciales incorrectas (Contraseña o correo mal)" },
            404: { description: "Usuario no encontrado" }
          }
        }
      }
    },
  },
  apis: [], 
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;