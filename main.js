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

  const configPath = path.join(app.getPath('userData'), 'kanban-config.json')

  ipcMain.handle('config:load', () => {
    try {
      if (fs.existsSync(configPath)) return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      return {}
    } catch { return {} }
  })

  ipcMain.handle('config:save', (_event, data) => {
    try {
      fs.writeFileSync(configPath, JSON.stringify(data, null, 2), 'utf-8')
      return true
    } catch { return false }
  })

  ipcMain.handle('log:sync-github', async (_event, { token, owner, repo, filePath, content }) => {
    try {
      const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'kanban-tracker'
      }

      let sha = null
      const getRes = await fetch(apiBase, { headers })
      if (getRes.ok) {
        const fileData = await getRes.json()
        sha = fileData.sha
      }

      const body = {
        message: `Update Daily Learning Log - ${new Date().toISOString().slice(0, 10)}`,
        content: Buffer.from(content, 'utf-8').toString('base64'),
        ...(sha ? { sha } : {})
      }

      const putRes = await fetch(apiBase, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!putRes.ok) {
        const errData = await putRes.json()
        return { success: false, error: errData.message || `HTTP ${putRes.status}` }
      }
      return { success: true }
    } catch (e) {
      return { success: false, error: e.message }
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
