const { spawn, execSync } = require("child_process");
const path = require("path");

const limpiarProcesosAnteriores = () => {
  try {
    if (process.platform === "win32") {
      execSync('taskkill /F /IM python.exe /T', { stdio: 'ignore' });
    }
  } catch (_) {}
};

exports.spawnWhisper = (inputPath, outputPath, language = "es", model = "base", callback) => {
  limpiarProcesosAnteriores();

  const isWin = process.platform === "win32";
  const venvPath = path.resolve(__dirname, "../../venv", isWin ? "Scripts" : "bin");
  const pythonExe = path.join(venvPath, isWin ? "python.exe" : "python3");

  const scriptPath = path.resolve(__dirname, "../python/transcribe.py");

  const env = {
    ...process.env,
    PATH: `${venvPath}${isWin ? ';' : ':'}${process.env.PATH}`,
    TF_CPP_MIN_LOG_LEVEL: "3",
    PYTHONIOENCODING: "utf-8",
  };

  const args = [
    scriptPath,
    "--input", inputPath,
    "--output", outputPath,
    "--language", language,
    "--model", model,
  ];

  const child = spawn(pythonExe, args, { env, shell: false });
  let stderrLog = "";
  let stdoutLog = "";

  child.stdout.on("data", (data) => { stdoutLog += data.toString(); });
  child.stderr.on("data", (data) => { stderrLog += data.toString(); });

  child.on("close", (code) => {
    callback(code !== 0 ? new Error(stderrLog || `Exit code ${code}`) : null, { stdout: stdoutLog, stderr: stderrLog });
  });
};
