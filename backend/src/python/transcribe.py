import argparse
import os
import sys
import json

try:
    import whisper
except Exception as e:
    sys.stderr.write(f"Failed to import whisper: {e}\n")
    sys.exit(1)


def ensure_dir(path: str):
    if not os.path.exists(path):
        os.makedirs(path, exist_ok=True)


def main():
    parser = argparse.ArgumentParser(description="Transcribe audio to text using OpenAI Whisper")
    parser.add_argument("--input", required=True, help="Input audio file path")
    parser.add_argument("--output", required=True, help="Output text file path")
    parser.add_argument("--language", default="es", help="Language code (e.g., es, en)")
    parser.add_argument("--model", default="base", help="Whisper model size (tiny, base, small, medium, large)")
    args = parser.parse_args()

    audio_path = os.path.abspath(args.input)
    output_path = os.path.abspath(args.output)
    output_dir = os.path.dirname(output_path)
    ensure_dir(output_dir)

    if not os.path.isfile(audio_path):
        sys.stderr.write(f"Input file does not exist: {audio_path}\n")
        sys.exit(2)

    try:
        sys.stdout.write(f"Loading whisper model: {args.model}\n")
        model = whisper.load_model(args.model)
        sys.stdout.write(f"Transcribing: {audio_path} (lang={args.language})\n")
        result = model.transcribe(audio_path, language=args.language)
        text = result.get("text", "").strip()

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(text + "\n")

        # Also print a compact JSON summary to stdout
        summary = {
            "language": args.language,
            "model": args.model,
            "duration": result.get("segments", [{}])[-1].get("end", None),
            "text_len": len(text),
        }
        sys.stdout.write(json.dumps(summary) + "\n")
    except Exception as e:
        sys.stderr.write(f"Transcription failed: {e}\n")
        sys.exit(3)


if __name__ == "__main__":
    main()
