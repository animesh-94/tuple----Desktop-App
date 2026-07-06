import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  saveProject: (data: string) => ipcRenderer.invoke('save-project', data),
  exportMigrations: (upSql: string, downSql: string) => ipcRenderer.invoke('export-migrations', upSql, downSql),
  runCommand: (cmd: string) => ipcRenderer.invoke('run-command', cmd),

  // Project Files
  saveProjectFile: (filePath: string, dataString: string) => ipcRenderer.invoke('save-project-file', { filePath, dataString }),
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
  
  // Global Settings
  getSetting: (key: string) => ipcRenderer.invoke('get-setting', key),
  setSetting: (key: string, value: any) => ipcRenderer.invoke('set-setting', { key, value }),
  
  // Secure Storage
  saveApiKey: (keyName: string, plainTextKey: string) => ipcRenderer.invoke('save-api-key', { keyName, plainTextKey }),
  getApiKey: (keyName: string) => ipcRenderer.invoke('get-api-key', keyName)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
