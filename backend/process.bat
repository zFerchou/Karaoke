@echo off
setlocal
cd /d "%~dp0"
call "venv\Scripts\activate"
:: Usamos python -m para asegurar que cargue los módulos del venv correctamente
python -m spleeter %*
endlocal