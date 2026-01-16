const { spawn } = require("child_process");
const path = require("path");

exports.spawnSpleeter = (inputPath, outputDir, callback) => {
  const isWin = process.platform === "win32";
  const venvPath = path.resolve(__dirname, "../../venv", isWin ? "Scripts" : "bin");
  const pythonExe = path.join(venvPath, isWin ? "python.exe" : "python3");

  const env = { 
    ...process.env, 
    PATH: `${venvPath}${isWin ? ';' : ':'}${process.env.PATH}`,
    // --- ESTABILIZADORES ---
    CUDA_VISIBLE_DEVICES: "-1",  // Fuerza modo CPU para evitar el error 3221226505
    TF_CPP_MIN_LOG_LEVEL: "3",   // Silencia advertencias innecesarias
    PYTHONIOENCODING: "utf-8"
  };

  const args = [
    "-m", "spleeter", "separate", 
    "-p", "spleeter:2stems", 
    "-o", outputDir, 
    "-c", "mp3", 
    "-b", "128k", 
    inputPath
  ];

  const child = spawn(pythonExe, args, { env });
  let errorLog = "";

  child.stderr.on("data", (data) => {
    errorLog += data.toString();
    process.stdout.write(`[Python Log]: ${data}`);
  });

  child.on("close", (code) => {
    console.log(`[DEBUG] Python cerró con código: ${code}`);
    callback(code !== 0 ? true : null, errorLog);
  });
};