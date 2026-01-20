# Transcripción de Audio con Whisper

Esta API agrega un endpoint para transcribir audio a texto usando OpenAI Whisper (ejecución local mediante Python).

## Requisitos

- Python 3.9+ (recomendado)
- Virtualenv ya existente en `backend/venv` (usado por Spleeter)
- FFmpeg instalado y disponible en el `PATH`
- Paquetes Python:
  - `openai-whisper`
  - (Torch se instalará como dependencia automáticamente; si necesitas GPU, instala la variante de CUDA adecuada)

## Instalación (Windows)

```powershell
cd C:\Users\rookl\Documents\KaraokeBar\Karaoke\backend
# Activar venv existente
venv\Scripts\activate
# Instalar Whisper (CPU)
pip install --upgrade pip
pip install openai-whisper

# Opcional: si quieres GPU CUDA (ejemplo para CUDA 11.8)
# pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

Verifica que `ffmpeg` esté instalado (ej.: `ffmpeg -version`).

## Endpoints

- POST `/api/transcribe/whisper`
  - Form-data:
    - `audio`: archivo de audio (binary)
    - `language`: código de idioma (default `es`)
    - `model`: tamaño del modelo (default `base`) — opciones: `tiny`, `base`, `small`, `medium`, `large`
  - Respuesta:
    - `file`: URL pública del archivo de texto generado
    - `info`: metadatos del proceso

## Ejemplo CURL

```bash
curl -X POST \
  "http://localhost:3000/api/transcribe/whisper" \
  -H "accept: */*" \
  -H "Content-Type: multipart/form-data" \
  -F "audio=@Los Tigres Del Norte - La Mesa Del Rincón (Audio).mp3;type=audio/mpeg" \
  -F "language=es" \
  -F "model=base"
```

La respuesta incluirá el enlace a `outputs/<nombre>/transcript.txt`. Puedes abrirlo directamente desde el navegador: `http://localhost:3000/outputs/<nombre>/transcript.txt`.

## Notas de rendimiento

- `base` es un buen punto de partida en CPU; si va lento, usa `tiny`.
- En GPU, `small` o `medium` mejoran bastante la precisión.

## Errores comunes

- `Failed to import whisper`: instala `openai-whisper` dentro del venv y asegúrate de activarlo.
- `ffmpeg not found`: instala FFmpeg y agrega su carpeta `bin` al `PATH`.
- `Exit code 3`: error de transcripción — revisa formato del audio y los logs.
