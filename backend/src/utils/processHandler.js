const { spawn } = require("child_process");
const path = require("path");

exports.spawnSpleeter = (inputPath, outputDir, callback) => {
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
    // Ayuda a gestionar mejor la RAM en Windows 10/11
    PYTHONMALLOC: "malloc" 
  };

  const args = [
    "-m", "spleeter", "separate", 
    "-p", "spleeter:2stems", 
    "-o", outputDir, 
    "-c", "mp3", 
    "-b", "320k", // <--- MEJORA: Máxima calidad de audio MP3
    "-d", "600",  // <--- SEGURIDAD: Límite de 10 min para evitar colapsos de RAM
    inputPath
  ];

  // Agregamos shell: false para que sea más estable en el manejo de rutas con espacios
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
    console.log(`[DEBUG] Python cerró con código: ${code}`);
    // Si el código es 0, todo salió bien.
    callback(code !== 0 ? true : null, errorLog);
  });
};