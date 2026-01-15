const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Spleeter Backend",
      version: "1.0.0",
      description: "Backend en Node.js para separar voz y música usando Spleeter",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor local",
      },
    ],
    // Definimos la ruta aquí para evitar errores de parseo en index.js
    paths: {
      "/separate": {
        post: {
          summary: "Separar voz y acompañamiento",
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
            200: {
              description: "Separación completada con éxito",
            },
            500: {
              description: "Error en el procesamiento",
            },
          },
        },
      },
    },
  },
  apis: [], // Ya no necesitamos escanear index.js porque definimos el path arriba
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;