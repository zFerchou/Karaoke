const { spawn, exec } = require("node:child_process");
const path = require("node:path");

exports.validarAudio = (filePath, callback) => {
  // Ajustamos el comando para obtener formato y duración de forma independiente
  const command = `ffprobe -v error -show_entries format=duration,format_name -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;

  exec(command, (error, stdout) => {
    if (error) {
      return callback(
        false,
        "Archivo corrupto o no es un formato de audio/video válido",
      );
    }

    const output = stdout.trim().split(/\s+/);

    let duration = Number.NaN;
    let formatName = "";

    output.forEach((val) => {
      const parsed = Number.parseFloat(val);
      if (Number.isNaN(parsed)) {
        formatName = val;
      } else {
        duration = parsed;
      }
    });

    const formatosProhibidos = ["tty", "bin", "data"];
    if (formatosProhibidos.some((f) => formatName.includes(f))) {
      return callback(false, "Tipo de archivo malicioso detectado");
    }

    if (Number.isNaN(duration)) {
      return callback(
        false,
        "El archivo subido no es un audio o video válido (sin duración detectable)",
      );
    }

    callback(true, null, duration);
  });
};

exports.applyAudioFilter = (
  inputPath,
  outputPath,
  filterType,
  format,
  bitrate,
  callback,
) => {
  const filterMap = {
    clean:
      "afftdn=nr=18:nf=-20, highpass=f=100, lowpass=f=15000, agate=threshold=-28dB:ratio=2.5, treble=g=4:f=6000",
    vivid:
      "anequalizer=c0 f=100 w=100 g=-5|c0 f=5000 w=500 g=8, compand=attacks=0:points=-80/-80|-25/-10|-15/-6|0/-2, aexciter=level_in=1:level_out=0.8:amount=2, volume=1.3",
    radio:
      "highpass=f=400, lowpass=f=3500, extrastereo=m=0, acompressor=threshold=-15dB:ratio=6, aecho=0.8:0.88:10:0.5, volume=1.8",
    norm: "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=summary",
  };

  const args = [
    "-y",
    "-err_detect",
    "ignore_err",
    "-i",
    inputPath,
    "-af",
    filterMap[filterType] || "anull",
  ];

  if (format === "wav") {
    args.push("-c:a", "pcm_s16le");
  } else if (format === "flac") {
    args.push("-c:a", "flac");
  } else {
    args.push("-c:a", "libmp3lame", "-b:a", bitrate || "192k");
  }

  args.push(outputPath);

  const ffmpeg = spawn("ffmpeg", args);

  ffmpeg.stderr.on("data", (data) => {
    console.error(`FFmpeg Log: ${data}`);
  });

  ffmpeg.on("close", (code) => {
    console.log(`FFmpeg proceso cerrado con código: ${code}`);
    callback(code === 0);
  });
};
