const { spawn, execSync } = require("child_process");
const path = require("path");

// --- LIMPIEZA DE MEMORIA ---
const limpiarProcesosAnteriores = () => {
  try {
    if (process.platform === "win32") {
      // Elimina cualquier rastro de Python colgado en RAM
      execSync('taskkill /F /IM python.exe /T', { stdio: 'ignore' });
    }
  } catch (e) {
    // Silencioso si no hay procesos
  }
};

exports.spawnSpleeter = (inputPath, outputDir, format, callback) => {
  // Solo limpiar procesos si ocurre un error, no antes de cada tarea
  // limpiarProcesosAnteriores();

  const isWin = process.platform === "win32";
  const venvPath = path.resolve(__dirname, "../../venv", isWin ? "Scripts" : "bin");
  const pythonExe = path.join(venvPath, isWin ? "python.exe" : "python3");

  const env = {
    ...process.env,
    PATH: `${venvPath}${isWin ? ";" : ":"}${process.env.PATH}`,
    // --- ESTABILIZADORES Y ACELERADORES ---
    CUDA_VISIBLE_DEVICES: "-1", // Obliga a usar CPU (la GPU mal configurada crashea VS Code)
    TF_CPP_MIN_LOG_LEVEL: "3",
    OMP_NUM_THREADS: "1", // Limita a UN solo hilo. Es más lento, pero no satura la RAM
    MKL_NUM_THREADS: "1", // Evita que las librerías matemáticas disparen el consumo
    TF_NUM_INTRAOP_THREADS: "1",
    TF_NUM_INTEROP_THREADS: "1",
    PYTHONMALLOC: "malloc",
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

  const child = spawn(pythonExe, args, { env, shell: false });

  let errorLog = "";
  child.stderr.on("data", (data) => {
    errorLog += data.toString();
    process.stdout.write(`[Python Log]: ${data}`);
  });

  child.on("close", (code) => {
    console.log(`[DEBUG] Python terminó proceso con código: ${code}`);
    // Si falló, limpiamos inmediatamente para liberar la RAM
    if (code !== 0) limpiarProcesosAnteriores();
    callback(code !== 0 ? true : null, errorLog);
  });
};


