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
  },
  apis: ["./index.js"], // donde se documentan las rutas
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
