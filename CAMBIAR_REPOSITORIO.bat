@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
echo ========================================================
echo   MAESTRIA BARBERIA - CAMBIAR A NUEVA CUENTA / REPO
echo ========================================================
echo.
echo Remote actual:
git remote -v
echo.
echo Ingresa los datos de tu nueva cuenta:
echo.
set /p "NUEVO_REPO=1. Pega la URL del nuevo repositorio GitHub (ej: https://github.com/usuario/maestria-barberia.git): "
if "%NUEVO_REPO%"=="" (
    echo [ERROR] No ingresaste ninguna URL. Operacion cancelada.
    pause
    exit /b 1
)

set /p "NUEVO_EMAIL=2. Correo de la nueva cuenta (opcional, ENTER para omitir): "
set /p "NUEVO_USER=3. Nombre de usuario GitHub nuevo (opcional, ENTER para omitir): "

if not "%NUEVO_EMAIL%"=="" git config user.email "%NUEVO_EMAIL%"
if not "%NUEVO_USER%"=="" git config user.name "%NUEVO_USER%"

echo.
echo Actualizando remoto a: %NUEVO_REPO%
git remote set-url origin %NUEVO_REPO%

echo.
echo Subiendo ramas y codigo al nuevo repositorio...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   [EXITO] Repositorio migrado y sincronizado correctamente!
    echo ========================================================
) else (
    echo.
    echo [AVISO] Si te pidio credenciales o fallo la autenticacion,
    echo asegurate de tener permisos en el nuevo repositorio.
)

pause
