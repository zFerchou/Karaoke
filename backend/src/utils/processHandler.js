const { spawn, execSync } = require("child_process");
const path = require("path");

// --- FUNCIÓN DE LIMPIEZA PREVENTIVA ---
const limpiarProcesosAnteriores = () => {
  try {
    if (process.platform === "win32") {
      // Mata cualquier proceso de python.exe que esté colgado antes de empezar
      execSync('taskkill /F /IM python.exe /T', { stdio: 'ignore' });
    }
  } catch (e) {
    // Si no hay procesos que matar, simplemente ignoramos el error
  }
};

exports.spawnSpleeter = (inputPath, outputDir, format, callback) => {
  // 1. Ejecutamos la limpieza antes de lanzar el nuevo proceso
  limpiarProcesosAnteriores();

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
    PYTHONMALLOC: "malloc",
    // Forzamos a que Python no guarde archivos .pyc que puedan corromperse
    PYTHONDONTWRITEBYTECODE: "1" 
  };

  let args = [
    "-m", "spleeter", "separate", 
    "-p", "spleeter:2stems", 
    "-o", outputDir, 
    "-c", format, 
    "-d", "600",
    inputPath
  ];

  if (format === "mp3") {
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
    
    // 2. Limpieza al finalizar: Ayuda a liberar la RAM inmediatamente
    if (code !== 0) {
        limpiarProcesosAnteriores();
    }
    
    callback(code !== 0 ? true : null, errorLog);
  });
};