const { spawn } = require("child_process");

/**
 * 
 * @param {string} inputPath 
 * @param {string} outputPath 
 * @param {function} callback 
 */
exports.applyNoiseGate = (inputPath, outputPath, callback) => {
  
  const args = [
    "-y", "-i", inputPath,
    "-af", "afftdn=nr=12,agate=threshold=-35dB:ratio=4",
    outputPath
  ];
  const ffmpeg = spawn("ffmpeg", args);
  let errorLog = "";
  ffmpeg.stderr.on("data", (data) => { errorLog += data.toString(); });
  ffmpeg.on("close", (code) => {
    if (code === 0) {
      callback(null);
    } else {
      callback(errorLog || "Error aplicando noise gate");
    }
  });
};
