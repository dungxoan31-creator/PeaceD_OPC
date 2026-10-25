:: PeaceD OPC Launcher - Nguyen Huu Dung
@echo off
title PeaceD OPC Launcher
cd /d "%~dp0"
echo ===================================================
echo Starting PeaceD OPC...
echo Directory: %CD%
echo ===================================================
set "ORCA_SKIP_DEV_WEB_PREPARE=1"
node config\scripts\run-electron-vite-dev.mjs %*
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] PeaceD OPC exited with error code %ERRORLEVEL%.
    pause
)
