const { spawnSpleeter } = require("../utils/processHandler");
const path = require("path");
const fs = require("fs");

exports.separateAudio = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No se recibió archivo de audio." });
    }

    const format = (req.body.format || "mp3").toLowerCase();
    // Usar separation según el Swagger corregido
    const separation = (req.body.separation || "both").toLowerCase();
    const startTime = Date.now();
    const originalName = req.file.originalname;
    const folderName = path.parse(req.file.filename).name;
    
    const inputPath = path.resolve(__dirname, "../../uploads", req.file.filename);
    const outputDir = path.resolve(__dirname, "../../outputs");

    console.log(`\n [NUEVA TAREA] ──────────────────────────────────────────`);
    console.log(` Archivo: ${originalName} | Pedido: ${separation.toUpperCase()}`);

    spawnSpleeter(inputPath, outputDir, format, (err, logOutput) => {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

        if (err) {
            return res.status(500).json({ error: "Fallo en motor IA", details: logOutput });
        }

        const finalFolder = path.join(outputDir, folderName);
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        // Rutas públicas para el JSON
        const vocalUrl = `/outputs/${folderName}/vocals.${format}`;
        const accUrl = `/outputs/${folderName}/accompaniment.${format}`;
        
        // Rutas físicas para borrar archivos no deseados
        const vocalFile = path.join(finalFolder, `vocals.${format}`);
        const accFile = path.join(finalFolder, `accompaniment.${format}`);

        let responseFiles = {};

        // Lógica de selección de archivos
        if (separation === "vocals") {
            if (fs.existsSync(vocalFile)) {
                responseFiles.vocals = vocalUrl;
            } else {
                return res.status(500).json({ error: "No se generó el archivo de vocals." });
            }
            if (fs.existsSync(accFile)) fs.unlinkSync(accFile);
        } 
        else if (separation === "accompaniment") {
            if (fs.existsSync(accFile)) {
                responseFiles.accompaniment = accUrl;
            } else {
                return res.status(500).json({ error: "No se generó el archivo de accompaniment." });
            }
            if (fs.existsSync(vocalFile)) fs.unlinkSync(vocalFile);
        } 
        else if (separation === "both") {
            if (fs.existsSync(vocalFile) && fs.existsSync(accFile)) {
                responseFiles.vocals = vocalUrl;
                responseFiles.accompaniment = accUrl;
            } else {
                return res.status(500).json({ error: "No se generaron ambos archivos correctamente." });
            }
        } else {
            return res.status(400).json({ error: "Parámetro 'separation' inválido." });
        }

        console.log(`✅ [ÉXITO] ${duration}s | Entregado: ${separation}`);

        return res.json({
            status: "Success",
            info: { originalName, processingTime: `${duration}s`, selected: separation },
            files: responseFiles
        });
    });
};