const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

let mainWindow

app.whenReady().then(() => {
  const dataPath = path.join(app.getPath('userData'), 'kanban-board.json')

  ipcMain.handle('board:load', () => {
    try {
      if (fs.existsSync(dataPath)) {
        return JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
      }
      return { cards: [] }
    } catch {
      return { cards: [] }
    }
  })

  ipcMain.handle('board:save', (_event, data) => {
    try {
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8')
      return true
    } catch {
      return false
    }
  })

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Kanban Tracker',
    backgroundColor: '#0f0f17',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.loadFile('renderer/index.html')

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow.loadFile('renderer/index.html')
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
