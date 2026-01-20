const cron = require("node-cron");
const fs = require("node:fs");
const path = require("node:path");

const startCleanupTask = () => {
  // Se ejecuta cada hora (0 * * * *)
  cron.schedule("0 * * * *", () => {
    console.log("---------------------------------------");
    console.log("Iniciando limpieza de archivos temporales...");

    const directory = path.join(__dirname, "../../outputs/voice_filters");
    const now = Date.now();
    const EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 horas

    if (fs.existsSync(directory)) {
      fs.readdir(directory, (err, files) => {
        if (err) {
          return console.error("❌ Error al leer carpeta para limpieza:", err);
        }

        files.forEach((file) => {
          const filePath = path.join(directory, file);

          fs.stat(filePath, (err, stats) => {
            if (err) return;

            if (now - stats.mtimeMs > EXPIRATION_TIME) {
              fs.unlink(filePath, (err) => {
                if (err) {
                  console.error(`No se pudo borrar ${file}:`, err);
                } else {
                  console.log(`Archivo expirado eliminado: ${file}`);
                }
              });
            }
          });
        });
      });
    }
    console.log("---------------------------------------");
  });
};

module.exports = { startCleanupTask };
