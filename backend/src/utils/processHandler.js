const { spawn, execSync } = require("child_process");
const path = require("path");

const procesosSpleeter = {};

const limpiarProcesosAnteriores = () => {
  try {
    if (process.platform === "win32") {
      execSync('taskkill /F /IM python.exe /T', { stdio: 'ignore' });
    }
  } catch (e) {}
};

// Se añade fileKey para sincronizar con el originalname del frontend
exports.spawnSpleeter = (inputPath, outputDir, format, fileKey, callback) => {
  const isWin = process.platform === "win32";
  const venvPath = path.resolve(__dirname, "../../venv", isWin ? "Scripts" : "bin");
  const pythonExe = path.join(venvPath, isWin ? "python.exe" : "python3");

  const env = {
    ...process.env,
    PATH: `${venvPath}${isWin ? ";" : ":"}${process.env.PATH}`,
    CUDA_VISIBLE_DEVICES: "-1",
    TF_CPP_MIN_LOG_LEVEL: "3",
    OMP_NUM_THREADS: "5",
    MKL_NUM_THREADS: "2",
    TF_NUM_INTRAOP_THREADS: "2",
    TF_NUM_INTEROP_THREADS: "2",
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

  // Guardamos usando la clave sincronizada
  procesosSpleeter[fileKey] = child;
  console.log(`[DEBUG] Proceso registrado con clave: ${fileKey}`);

  let errorLog = "";
  child.stderr.on("data", (data) => {
    errorLog += data.toString();
  });

  child.on("close", (code) => {
    delete procesosSpleeter[fileKey];
    if (code !== 0) limpiarProcesosAnteriores();
    callback(code !== 0 ? true : null, errorLog);
  });
};

exports.cancelSpleeterProcess = (fileName) => {
  const proc = procesosSpleeter[fileName];
  if (proc) {
    proc.kill('SIGKILL');
    delete procesosSpleeter[fileName];
    console.log(`[CANCEL] Proceso ${fileName} abortado.`);
    return true;
  }
  return false;
};