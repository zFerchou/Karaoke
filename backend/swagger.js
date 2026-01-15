const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Karaoke Pro",
      version: "1.0.0",
      description: "Backend modular para procesamiento de audio",
    },
    servers: [{ url: "http://localhost:3000" }],
    paths: {
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
                    audio: { type: "string", format: "binary" }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "Archivos MP3 generados" },
            500: { description: "Error en el servidor" }
          }
        }
      }
    }
  },
  // Dejamos apis vacío o comentamos para que no intente parsear los comentarios que dan error
  apis: [], 
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;