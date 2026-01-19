const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Karaoke Pro",
      version: "1.0.0",
      description: "Backend modular con Spleeter Engine y gestión de audio.",
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
  },
  // CLAVE: Asegúrate de que esta ruta apunte a tus archivos .js de rutas
  apis: ["./src/routes/*.js"], 
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;