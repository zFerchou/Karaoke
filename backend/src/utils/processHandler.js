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
  limpiarProcesosAnteriores();

  const isWin = process.platform === "win32";
  const venvPath = path.resolve(__dirname, "../../venv", isWin ? "Scripts" : "bin");
  const pythonExe = path.join(venvPath, isWin ? "python.exe" : "python3");

  const env = { 
    ...process.env, 
    PATH: `${venvPath}${isWin ? ';' : ':'}${process.env.PATH}`,
    // --- ESTABILIZADORES Y ACELERADORES ---
    CUDA_VISIBLE_DEVICES: "-1",       // Desactiva GPU mal configurada (evita cuellos de botella)
    TF_CPP_MIN_LOG_LEVEL: "3",        // Menos logs = menos uso de CPU
    TF_ENABLE_ONEDNN_OPTS: "1",       // ACELERACIÓN: Activa optimizaciones de hardware modernas
    PYTHONMALLOC: "malloc",           // Gestión de RAM directa para evitar fragmentación
    PYTHONDONTWRITEBYTECODE: "1",     // No genera basura .pyc
    OMP_NUM_THREADS: "2",             // Usa menos hilos para evitar saturar RAM
    PYTHONIOENCODING: "utf-8"
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