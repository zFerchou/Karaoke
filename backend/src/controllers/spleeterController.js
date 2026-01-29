const { spawnSpleeter, cancelSpleeterProcess } = require("../utils/processHandler");
const path = require("path");
const fs = require("fs");
const { applyNoiseGate } = require("../utils/noiseGate");

exports.separateAudio = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No se recibió archivo de audio." });
    }

    const format = (req.body.format || "mp3").toLowerCase();
    const startTime = Date.now();
    const originalName = req.file.originalname; // Clave para cancelación
    const filenameWithoutExt = path.parse(req.file.filename).name; 
    
    const inputPath = path.resolve(__dirname, "../../uploads", req.file.filename);
    const outputDir = path.resolve(__dirname, "../../outputs");

    console.log(`\n🔵 [INICIO] Tarea Spleeter: ${originalName}`);

    // Pasamos originalName como fileKey
    spawnSpleeter(inputPath, outputDir, format, originalName, (err, logOutput) => {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

        if (err) {
            console.error("❌ Error en Python:", err);
            return res.status(500).json({ error: "Fallo en motor IA", details: logOutput });
        }

        const expectedFolder = path.join(outputDir, filenameWithoutExt);
        
        if (!fs.existsSync(expectedFolder)) {
            return res.status(500).json({ error: "No se creó la carpeta esperada." });
        }

        const filesInFolder = fs.readdirSync(expectedFolder);
        const actualVocal = filesInFolder.find(f => f.includes('vocals'));
        const actualAcc = filesInFolder.find(f => f.includes('accompaniment'));

        let foundFiles = {};

        if (actualAcc) {
            const accPath = path.join(expectedFolder, actualAcc);
            const accFiltered = path.join(expectedFolder, `filtered_${actualAcc}`);
            applyNoiseGate(accPath, accFiltered, (errGate) => {
                if (!errGate && fs.existsSync(accFiltered)) {
                    foundFiles.accompaniment = `/outputs/${filenameWithoutExt}/filtered_${actualAcc}`;
                } else {
                    foundFiles.accompaniment = `/outputs/${filenameWithoutExt}/${actualAcc}`;
                }
                if (actualVocal) foundFiles.vocals = `/outputs/${filenameWithoutExt}/${actualVocal}`;
                
                const duration = ((Date.now() - startTime) / 1000).toFixed(2);
                return res.json({ status: "Success", info: { processingTime: `${duration}s` }, files: foundFiles });
            });
            return;
        }

        if (actualVocal) foundFiles.vocals = `/outputs/${filenameWithoutExt}/${actualVocal}`;
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        return res.json({ status: "Success", info: { processingTime: `${duration}s` }, files: foundFiles });
    });
};

exports.cancelSpleeter = (req, res) => {
    const { fileName } = req.body;
    if (!fileName) return res.status(400).json({ error: "Falta el nombre del archivo." });
    const ok = cancelSpleeterProcess(fileName);
    if (ok) return res.json({ status: "cancelled" });
    return res.status(404).json({ error: "No se encontró proceso activo." });
};