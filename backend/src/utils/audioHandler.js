const { spawn, exec } = require("node:child_process");
const path = require("node:path");

exports.validarAudio = (filePath, callback) => {
  const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;

  exec(command, (error, stdout) => {
    if (error) {
      return callback(false, "Archivo corrupto o formato no soportado");
    }
    const duration = Number.parseFloat(stdout);
    callback(!Number.isNaN(duration), null, duration);
  });
};

exports.applyAudioFilter = (inputPath, outputPath, filterType, callback) => {
  const filterMap = {
    clean:
      "afftdn=nr=18:nf=-20, highpass=f=100, lowpass=f=15000, agate=threshold=-28dB:ratio=2.5, treble=g=4:f=6000",
    vivid:
      "anequalizer=c0 f=100 w=100 g=-5|c0 f=5000 w=500 g=8, compand=attacks=0:points=-80/-80|-25/-10|-15/-6|0/-2, aexciter=level_in=1:level_out=0.8:amount=2, volume=1.3",
    radio:
      "highpass=f=400, lowpass=f=3500, extrastereo=m=0, acompressor=threshold=-15dB:ratio=6, aecho=0.8:0.88:10:0.5, volume=1.8",
  };

  const args = [
    "-y",
    "-err_detect",
    "ignore_err",
    "-i",
    inputPath,
    "-af",
    filterMap[filterType] || "anull",
    "-c:a",
    "libmp3lame",
    "-b:a",
    "192k",
    "-ac",
    "2",
    "-ar",
    "44100",
    outputPath,
  ];

  const ffmpeg = spawn("ffmpeg", args);

  ffmpeg.stderr.on("data", (data) => {
    console.error(`FFmpeg Log: ${data}`);
  });

  ffmpeg.on("close", (code) => {
    console.log(`FFmpeg proceso cerrado con código: ${code}`);
    callback(code === 0);
  });
};
