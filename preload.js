const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('kanban', {
  loadBoard: () => ipcRenderer.invoke('board:load'),
  saveBoard: (data) => ipcRenderer.invoke('board:save', data)
})
