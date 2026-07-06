import { app, shell, BrowserWindow, ipcMain, dialog, safeStorage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.handle('save-project', async (_event, data: string) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Save Project',
      defaultPath: 'schema.json',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    
    if (!canceled && filePath) {
      const fs = require('fs')
      await fs.promises.writeFile(filePath, data, 'utf-8')
      return true
    }
    return false
  })

  ipcMain.handle('export-migrations', async (_event, upSql: string, downSql: string) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Export Migrations (Select Folder)',
      properties: ['openDirectory']
    })

    if (!canceled && filePaths.length > 0) {
      const folderPath = filePaths[0]
      const fs = require('fs')
      const path = require('path')
      
      await fs.promises.writeFile(path.join(folderPath, 'up.sql'), upSql, 'utf-8')
      await fs.promises.writeFile(path.join(folderPath, 'down.sql'), downSql, 'utf-8')
      return true
    }
    return false
  })

  ipcMain.handle('run-command', async (_event, cmd: string) => {
    const { exec } = require('node:child_process')
    const util = require('node:util')
    const execPromise = util.promisify(exec)
    
    try {
      const { stdout, stderr } = await execPromise(cmd, { cwd: app.getPath('userData') })
      return { stdout, stderr }
    } catch (error: any) {
      return { stdout: error.stdout || '', stderr: error.stderr || '', error: error.message }
    }
  })

  // Project Files
  ipcMain.handle('show-save-dialog', async () => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Save Project',
      defaultPath: 'schema.tuple.json',
      filters: [{ name: 'Tuple Project', extensions: ['json'] }]
    })
    return canceled ? null : filePath
  })

  ipcMain.handle('save-project-file', async (_event, { filePath, dataString }) => {
    try {
      const fs = require('fs')
      await fs.promises.writeFile(filePath, dataString, 'utf-8')
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  })

  // Global Settings
  const Store = require('electron-store')
  const store = new Store()

  ipcMain.handle('get-setting', (_event, key: string) => {
    return store.get(key)
  })

  ipcMain.handle('set-setting', (_event, { key, value }) => {
    store.set(key, value)
    return true
  })

  // Secure Storage
  ipcMain.handle('save-api-key', (_event, { keyName, plainTextKey }) => {
    try {
      if (safeStorage.isEncryptionAvailable()) {
        const encrypted = safeStorage.encryptString(plainTextKey)
        store.set(`keys.${keyName}`, encrypted.toString('hex'))
        return true
      }
      return false
    } catch (e) {
      console.error('Encryption failed', e)
      return false
    }
  })

  ipcMain.handle('get-api-key', (_event, keyName: string) => {
    try {
      const encryptedHex = store.get(`keys.${keyName}`) as string
      if (encryptedHex && safeStorage.isEncryptionAvailable()) {
        const buffer = Buffer.from(encryptedHex, 'hex')
        return safeStorage.decryptString(buffer)
      }
      return null
    } catch (e) {
      console.error('Decryption failed', e)
      return null
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
