' PeaceD OPC - Nghiên cứu & Phát triển bởi Nguyễn Hữu Dũng (MSV: 11235559)
' PeaceD OPC Launcher - Nguyen Huu Dung
' PeaceD OPC Silent Launcher
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get project root directory from script location
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = scriptDir

' Launch PeaceD OPC dev runner silently (0 = hide console window)
WshShell.Run "cmd.exe /c set ORCA_SKIP_DEV_WEB_PREPARE=1 && node config\scripts\run-electron-vite-dev.mjs", 0, False
