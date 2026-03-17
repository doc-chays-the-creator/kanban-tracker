$WshShell = New-Object -ComObject WScript.Shell
$Desktop = [System.Environment]::GetFolderPath('Desktop')
$Shortcut = $WshShell.CreateShortcut("$Desktop\Kanban Tracker.lnk")
$Shortcut.TargetPath = "C:\Users\crm66\Documents\Chayton-Personal-Projects\kanban-tracker\node_modules\electron\dist\electron.exe"
$Shortcut.Arguments = "C:\Users\crm66\Documents\Chayton-Personal-Projects\kanban-tracker"
$Shortcut.WorkingDirectory = "C:\Users\crm66\Documents\Chayton-Personal-Projects\kanban-tracker"
$Shortcut.IconLocation = "C:\Users\crm66\Documents\Chayton-Personal-Projects\kanban-tracker\node_modules\electron\dist\electron.exe,0"
$Shortcut.Description = "Kanban Tracker"
$Shortcut.Save()
Write-Host "Shortcut updated at: $Desktop\Kanban Tracker.lnk"
