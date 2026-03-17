const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('kanban', {
  loadBoard:   () => ipcRenderer.invoke('board:load'),
  saveBoard:   (data) => ipcRenderer.invoke('board:save', data),
  loadConfig:  () => ipcRenderer.invoke('config:load'),
  saveConfig:  (data) => ipcRenderer.invoke('config:save', data),
  syncLog:     (params) => ipcRenderer.invoke('log:sync-github', params)
})
