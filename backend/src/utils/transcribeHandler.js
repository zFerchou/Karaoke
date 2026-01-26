const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const limpiarProcesosAnteriores = () => {
  try {
    if (process.platform === "win32") {
      execSync('taskkill /F /IM python.exe /T', { stdio: 'ignore' });
    }
  } catch (_) {}
};

// Ejecuta Whisper CLI para generar múltiples formatos (txt, srt, json)
// Nota: ahora recibe outputDir en lugar de outputPath
exports.spawnWhisper = (inputPath, outputDir, language = "es", model = "base", callback) => {
  limpiarProcesosAnteriores();

  const isWin = process.platform === "win32";
  const venvPath = path.resolve(__dirname, "../../venv", isWin ? "Scripts" : "bin");
  // En Windows, whisper se instala como whisper.exe en venv\Scripts
  // En Unix, suele ser un binario/launcher llamado "whisper"
  const whisperCmd = path.join(venvPath, isWin ? "whisper.exe" : "whisper");

  const env = {
    ...process.env,
    PATH: `${venvPath}${isWin ? ';' : ':'}${process.env.PATH}`,
    TF_CPP_MIN_LOG_LEVEL: "3",
    PYTHONIOENCODING: "utf-8",
  };
  
  // Asegurar nombre fijo de salida: transcript.* dentro de outputDir
  const args = [
    inputPath,
    "--language", language,
    "--model", model,
    "--device", "cpu",
    "--fp16", "False",
    "--output_dir", outputDir,
    "--output_format", "all",
  ];

  const child = spawn(whisperCmd, args, { env, shell: false });
  let stderrLog = "";
  let stdoutLog = "";

  child.stdout.on("data", (data) => { stdoutLog += data.toString(); });
  child.stderr.on("data", (data) => { stderrLog += data.toString(); });

  child.on("close", (code) => {
    // Attempt to normalize output filenames regardless of exit code
    let hasOutputs = false;
    try {
      const baseName = path.parse(inputPath).name;
      ["txt", "srt", "json"].forEach((ext) => {
        const src = path.join(outputDir, `${baseName}.${ext}`);
        const dst = path.join(outputDir, `transcript.${ext}`);
        if (fs.existsSync(src)) {
          try { fs.renameSync(src, dst); } catch (_) {}
        }
        if (fs.existsSync(dst)) {
          hasOutputs = true;
        }
      });
    } catch (_) {}

    if (code === 0 || hasOutputs) {
      // Treat as success if exit code is 0 or we have the expected outputs
      callback(null, { stdout: stdoutLog, stderr: stderrLog });
    } else {
      // Propagate error with captured stderr
      callback(new Error(stderrLog || `Exit code ${code}`), { stdout: stdoutLog, stderr: stderrLog });
    }
  });
};
