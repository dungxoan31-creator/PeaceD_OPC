:: PeaceD OPC - Nghiên cứu & Phát triển bởi Nguyễn Hữu Dũng (MSV: 11235559)
:: PeaceD OPC Runner - Nguyen Huu Dung
@echo off
setlocal
cd /d "%~dp0"
echo ===================================================
echo   PeaceD OPC - Agent Organization & Studio
echo ===================================================
echo [1/3] Terminating existing app instances...
taskkill /F /IM electron.exe 2>nul
timeout /t 1 /nobreak >nul

echo [2/3] Building latest PeaceD OPC application...
call node config/scripts/run-electron-vite-build.mjs
if %errorlevel% neq 0 (
  echo Build failed with error code %errorlevel%.
  pause
  exit /b %errorlevel%
)

echo [3/3] Launching PeaceD OPC Studio...
start "" node node_modules\electron-vite\bin\electron-vite.js preview --skipBuild
echo PeaceD OPC launched successfully!
endlocal
