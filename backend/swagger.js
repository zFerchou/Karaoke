const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Karaoke Pro",
      version: "1.0.0",
      description: "Backend modular con Spleeter Engine (MP3/WAV), Filtros de Voz, Autenticación JWT y Google Login.",
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
      // --- RUTA SPLEETER (AUDIO AI) ---
      "/api/spleeter/separate": {
        post: {
          summary: "Separar audio en Voces y Acompañamiento",
          tags: ["Audio AI"],
          description: "Utiliza IA para separar las voces del instrumental. Permite elegir la calidad de salida (MP3 320k o WAV).",
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
                      description: "Selecciona el archivo MP3 o WAV a procesar"
                    },
                    format: { 
                      type: "string", 
                      enum: ["mp3", "wav"], 
                      default: "mp3",
                      description: "Formato de las pistas resultantes (MP3 para ligereza, WAV para máxima calidad)"
                    },
                  },
                  required: ["audio"],
                },
              },
            },
          },
          responses: {
            200: { 
                description: "Procesamiento exitoso",
                content: {
                    "application/json": {
                        example: {
                            status: "Success",
                            message: "Audio separado correctamente",
                            info: { originalName: "cancion.mp3", format: "WAV" },
                            files: { vocals: "/outputs/folder/vocals.wav", accompaniment: "/outputs/folder/accompaniment.wav" }
                        }
                    }
                }
            },
            400: { description: "Falta el archivo de audio" },
            500: { description: "Error interno en el motor Spleeter o falta de memoria RAM" },
          },
        },
      },

      // --- RUTA PARA EL FILTRO DE AUDIO ---
      "/api/audio/upload-filter": {
        post: {
          summary: "Cargar archivo y aplicar filtros de limpieza/mejora",
          tags: ["Filtro de voz"],
          description: "Permite subir un audio local y aplicarle filtros (clean, vivid, radio) usando FFmpeg.",
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    audio: { type: "string", format: "binary" },
                    filterType: {
                      type: "string",
                      enum: ["clean", "vivid", "radio"],
                      default: "clean",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Audio procesado con éxito" },
            500: { description: "Error en el motor de filtros" },
          },
        },
      },

      // --- RUTAS DE USUARIOS (Conservadas de tu rama HEAD) ---
      "/usuarios": {
        get: {
          summary: "Obtener lista de todos los usuarios",
          tags: ["Usuarios"],
          responses: {
            200: { description: "Lista de usuarios obtenida" },
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
            409: { description: "El correo ya está registrado" },
          },
        },
      },

      "/usuarios/perfil": {
        get: {
          summary: "Obtener perfil (Verificar Token)",
          tags: ["Usuarios"],
          description: "Ruta protegida. Requiere enviar el Token JWT en el Header.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Token válido, devuelve datos del usuario" },
            401: { description: "No autorizado" },
          },
        },
      },

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
                    correo: { type: "string", example: "usuario@test.com" },
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
          },
        },
      },

      "/usuarios/google-login": {
        post: {
          summary: "Iniciar Sesión con Google",
          tags: ["Usuarios"],
          description: "Recibe token de Google y gestiona el acceso/registro automático.",
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
            200: { description: "Login Google exitoso" },
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