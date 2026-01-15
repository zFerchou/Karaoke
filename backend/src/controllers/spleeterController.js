const { spawnSpleeter } = require("../utils/processHandler");
const path = require("path");
const fs = require("fs");

exports.separateAudio = (req, res) => {
    if (!req.file) {
        console.error("─── [❌ ERROR] Petición recibida sin archivo de audio.");
        return res.status(400).json({ error: "No se recibió ningún archivo de audio en la petición." });
    }

    const startTime = Date.now();
    const fileName = req.file.filename;
    const originalName = req.file.originalname;
    const folderName = path.parse(fileName).name;
    
    const inputPath = path.resolve(__dirname, "../../uploads", fileName);
    const outputDir = path.resolve(__dirname, "../../outputs");

    console.log(`\n [NUEVA TAREA] ──────────────────────────────────────────`);
    console.log(` Archivo Original: ${originalName}`);
    console.log(` ID de Proceso:    ${fileName}`);
    console.log(` Estado:          Iniciando motor de IA Spleeter...`);

    spawnSpleeter(inputPath, outputDir, (err, logOutput) => {
        if (err) {
            console.error(`❌ [FALLO CRÍTICO] Error al procesar ${originalName}`);
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            return res.status(500).json({ 
                error: "El motor Spleeter no pudo completar la tarea.",
                details: logOutput || "Error interno de Python/TensorFlow."
            });
        }

        console.log(` [PROCESANDO] IA trabajando en la separación de pistas...`);

        const finalFolder = path.join(outputDir, folderName);
        let attempts = 0;
        
        const interval = setInterval(() => {
            attempts++;
            const vocalPath = path.join(finalFolder, "vocals.mp3");

            if (fs.existsSync(vocalPath)) {
                clearInterval(interval);
                const duration = ((Date.now() - startTime) / 1000).toFixed(2);
                
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                
                console.log(`✅ [ÉXITO] ${originalName} procesado en ${duration}s`);
                console.log(` Carpeta de salida: /outputs/${folderName}/`);
                console.log(`───────────────────────────────────────────────────────────\n`);

                return res.json({
                    status: "Success",
                    message: "Audio separado correctamente",
                    info: {
                        originalName,
                        processingTime: `${duration}s`,
                        format: "MP3 (128kbps)"
                    },
                    files: {
                        vocals: `/outputs/${folderName}/vocals.mp3`,
                        accompaniment: `/outputs/${folderName}/accompaniment.mp3`
                    }
                });
            }

            if (attempts >= 180) {
                clearInterval(interval);
                console.error(` [TIMEOUT] El proceso tardó demasiado para: ${originalName}`);
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                res.status(500).json({ error: "Tiempo de procesamiento excedido (3 min)." });
            }
        }, 1000);
    });
};