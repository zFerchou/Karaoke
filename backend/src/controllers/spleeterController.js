const { spawnSpleeter } = require("../utils/processHandler");
const path = require("path");
const fs = require("fs");

exports.separateAudio = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No se recibió archivo de audio." });
    }

    // Configuración
    const format = (req.body.format || "mp3").toLowerCase();
    const separation = (req.body.separation || "vocals").toLowerCase();
    const startTime = Date.now();
    
    // Nombres de archivo
    const originalName = req.file.originalname;
    // IMPORTANTE: El nombre de la carpeta suele ser el nombre del archivo sin extensión
    const filenameWithoutExt = path.parse(req.file.filename).name; 
    
    const inputPath = path.resolve(__dirname, "../../uploads", req.file.filename);
    const outputDir = path.resolve(__dirname, "../../outputs");

    console.log(`\n🔵 [INICIO] Tarea Spleeter`);
    console.log(`   📂 Input: ${req.file.filename}`);
    console.log(`   🎯 Output esperado en: outputs/${filenameWithoutExt}`);

    spawnSpleeter(inputPath, outputDir, format, (err, logOutput) => {
        // Borramos el input original para limpiar
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

        if (err) {
            console.error("❌ Error en Python:", err);
            return res.status(500).json({ error: "Fallo en motor IA", details: logOutput });
        }

        // --- ZONA DE DIAGNÓSTICO ---
        const expectedFolder = path.join(outputDir, filenameWithoutExt);
        
        // 1. ¿Existe la carpeta?
        if (!fs.existsSync(expectedFolder)) {
            console.error(`❌ La carpeta esperada NO existe: ${expectedFolder}`);
            
            // DIAGNÓSTICO: Listar qué carpetas SÍ existen
            console.log("📂 Contenido actual de /outputs/:");
            try {
                const existingFolders = fs.readdirSync(outputDir);
                existingFolders.forEach(f => console.log(`   - ${f}`));
            } catch (e) { console.log("   (No se pudo leer outputs)"); }

            return res.status(500).json({ 
                error: "Spleeter terminó bien, pero no creó la carpeta esperada.",
                debug: "Revisar consola del backend para ver nombres de carpetas."
            });
        }

        // 2. ¿Existen los archivos dentro?
        const vocalFile = path.join(expectedFolder, `vocals.${format}`);
        const accFile = path.join(expectedFolder, `accompaniment.${format}`);

        let foundFiles = {};
        
        // Verificamos qué archivos existen realmente (a veces devuelve wav aunque pidas mp3)
        const filesInFolder = fs.readdirSync(expectedFolder);
        console.log(`📂 Archivos encontrados dentro de la carpeta:`, filesInFolder);

        // Buscamos coincidencias flexibles
        const actualVocal = filesInFolder.find(f => f.includes('vocals'));
        const actualAcc = filesInFolder.find(f => f.includes('accompaniment'));

        if (actualVocal) foundFiles.vocals = `/outputs/${filenameWithoutExt}/${actualVocal}`;
        if (actualAcc) foundFiles.accompaniment = `/outputs/${filenameWithoutExt}/${actualAcc}`;

        if (Object.keys(foundFiles).length > 0) {
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`✅ [ÉXITO] Archivos localizados correctamente en ${duration}s`);
            
            return res.json({
                status: "Success",
                info: { processingTime: `${duration}s` },
                files: foundFiles
            });
        } else {
            console.error("❌ Carpeta encontrada pero vacía o sin archivos correctos.");
            return res.status(500).json({ error: "Carpeta creada pero archivos no encontrados." });
        }
    });
};