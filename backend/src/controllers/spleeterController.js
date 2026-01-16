const { spawnSpleeter } = require("../utils/processHandler");
const path = require("path");
const fs = require("fs");

exports.separateAudio = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No se recibió ningún archivo de audio." });
    }

    // Obtenemos el formato del body (si no viene, por defecto mp3)
    const format = (req.body.format || "mp3").toLowerCase();
    const startTime = Date.now();
    const fileName = req.file.filename;
    const originalName = req.file.originalname;
    const folderName = path.parse(fileName).name;
    
    const inputPath = path.resolve(__dirname, "../../uploads", fileName);
    const outputDir = path.resolve(__dirname, "../../outputs");

    console.log(`\n [NUEVA TAREA] ──────────────────────────────────────────`);
    console.log(` Archivo Original: ${originalName}`);
    console.log(` Formato Salida:   ${format.toUpperCase()}`);
    console.log(` Estado:           Iniciando motor Spleeter...`);

    spawnSpleeter(inputPath, outputDir, format, (err, logOutput) => {
        if (err) {
            console.error(`❌ [FALLO CRÍTICO] Error al procesar ${originalName}`);
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            return res.status(500).json({ 
                error: "El motor Spleeter falló.",
                details: logOutput || "Error interno de Python."
            });
        }

        const finalFolder = path.join(outputDir, folderName);
        let attempts = 0;
        
        // Intervalo para verificar cuando la IA termine de escribir los archivos
        const interval = setInterval(() => {
            attempts++;
            const vocalPath = path.join(finalFolder, `vocals.${format}`);

            if (fs.existsSync(vocalPath)) {
                clearInterval(interval);
                const duration = ((Date.now() - startTime) / 1000).toFixed(2);
                
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                
                console.log(`✅ [ÉXITO] Procesado en ${duration}s (${format.toUpperCase()})`);

                return res.json({
                    status: "Success",
                    message: "Audio separado correctamente",
                    info: {
                        originalName,
                        processingTime: `${duration}s`,
                        format: format.toUpperCase()
                    },
                    files: {
                        vocals: `/outputs/${folderName}/vocals.${format}`,
                        accompaniment: `/outputs/${folderName}/accompaniment.${format}`
                    }
                });
            }

            // Timeout tras 3 minutos (180 intentos de 1 segundo)
            if (attempts >= 180) {
                clearInterval(interval);
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                res.status(500).json({ error: "Tiempo de espera agotado." });
            }
        }, 1000);
    });
};