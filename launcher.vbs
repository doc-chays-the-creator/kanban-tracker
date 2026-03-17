Set WshShell = CreateObject("WScript.Shell")
WshShell.Environment("Process")("ELECTRON_RUN_AS_NODE") = ""
WshShell.CurrentDirectory = "C:\Users\crm66\Documents\Chayton-Personal-Projects\kanban-tracker"
WshShell.Run """C:\Users\crm66\Documents\Chayton-Personal-Projects\kanban-tracker\node_modules\electron\dist\electron.exe"" .", 0, False
