@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
echo ========================================================
echo   MAESTRIA BARBERIA - SUBIR A GITHUB / VERCEL
echo ========================================================
echo.

git add .
set "MSG="
set /p "MSG=Ingresa una descripcion del cambio (o presiona ENTER para automatica): "
if "!MSG!"=="" set "MSG=Actualizacion Maestria Barberia"

git commit -m "!MSG!"
git push origin main

echo.
echo [EXITO] Cambios enviados a GitHub exitosamente.
pause
