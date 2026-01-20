const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

/**
 * Convierte un archivo de audio a 44100 Hz, estéreo (alta calidad, compatible con Spleeter)
 * @param {string} inputPath - Ruta del archivo original
 * @param {string} outputPath - Ruta del archivo convertido temporal
 * @param {function} callback - (err, newPath) => void
 */
exports.convertAudioForSpleeter = (inputPath, outputPath, callback) => {
    const args = [
        "-y",
        "-i", inputPath,
        "-ar", "32000", // Frecuencia de muestreo (calidad alta, menos RAM)
        "-ac", "2",     // Estéreo
        "-b:a", "192k", // Bitrate alto para MP3
        outputPath
    ];
    const ffmpeg = spawn("ffmpeg", args);
    let errorLog = "";
    ffmpeg.stderr.on("data", (data) => { errorLog += data.toString(); });
    ffmpeg.on("close", (code) => {
        if (code === 0 && fs.existsSync(outputPath)) {
            callback(null, outputPath);
        } else {
            callback(errorLog || "Error en conversión de audio");
        }
    });
};
