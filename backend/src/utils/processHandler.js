const { spawn } = require("child_process");
const path = require("path");

exports.spawnSpleeter = (inputPath, outputDir, format, callback) => {
  const isWin = process.platform === "win32";
  const venvPath = path.resolve(__dirname, "../../venv", isWin ? "Scripts" : "bin");
  const pythonExe = path.join(venvPath, isWin ? "python.exe" : "python3");

  const env = { 
    ...process.env, 
    PATH: `${venvPath}${isWin ? ';' : ':'}${process.env.PATH}`,
    // --- ESTABILIZADORES DE SISTEMA ---
    CUDA_VISIBLE_DEVICES: "-1",   
    TF_CPP_MIN_LOG_LEVEL: "3",    
    PYTHONIOENCODING: "utf-8",
    PYTHONMALLOC: "malloc" 
  };

  // Argumentos base: definimos formato y límite de tiempo
  let args = [
    "-m", "spleeter", "separate", 
    "-p", "spleeter:2stems", 
    "-o", outputDir, 
    "-c", format, // Dinámico: 'mp3' o 'wav'
    "-d", "600",  // Límite de 10 minutos
    inputPath
  ];

  // Si el usuario elige MP3, inyectamos la mejora de calidad a 320k
  if (format === "mp3") {
    // Insertamos el bitrate antes del path de entrada
    args.splice(args.length - 1, 0, "-b", "320k");
  }

  const child = spawn(pythonExe, args, { 
    env,
    shell: false 
  });

  let errorLog = "";

  child.stderr.on("data", (data) => {
    errorLog += data.toString();
    process.stdout.write(`[Python Log]: ${data}`);
  });

  child.on("close", (code) => {
    console.log(`[DEBUG] Python cerró con código: ${code} (Formato: ${format})`);
    callback(code !== 0 ? true : null, errorLog);
  });
};