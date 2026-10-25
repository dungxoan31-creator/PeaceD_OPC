Set WshShell = CreateObject("WScript.Shell")

' 1. Desktop shortcut
strDesktop = WshShell.SpecialFolders("Desktop")
Set oLinkDesktop = WshShell.CreateShortcut(strDesktop & "\PeaceD OPC.lnk")
oLinkDesktop.TargetPath = "wscript.exe"
oLinkDesktop.Arguments = """C:\Users\PeaceD\Downloads\orca\run-peaced-opc.vbs"""
oLinkDesktop.WorkingDirectory = "C:\Users\PeaceD\Downloads\orca"
oLinkDesktop.WindowStyle = 1
oLinkDesktop.IconLocation = "C:\Users\PeaceD\Downloads\orca\resources\build\icon.ico, 0"
oLinkDesktop.Description = "PeaceD OPC Desktop Application"
oLinkDesktop.Save

' 2. Project directory shortcut
Set oLinkLocal = WshShell.CreateShortcut("C:\Users\PeaceD\Downloads\orca\PeaceD OPC.lnk")
oLinkLocal.TargetPath = "wscript.exe"
oLinkLocal.Arguments = """C:\Users\PeaceD\Downloads\orca\run-peaced-opc.vbs"""
oLinkLocal.WorkingDirectory = "C:\Users\PeaceD\Downloads\orca"
oLinkLocal.WindowStyle = 1
oLinkLocal.IconLocation = "C:\Users\PeaceD\Downloads\orca\resources\build\icon.ico, 0"
oLinkLocal.Description = "PeaceD OPC Desktop Application"
oLinkLocal.Save
