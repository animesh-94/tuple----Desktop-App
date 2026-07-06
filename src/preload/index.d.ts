import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      saveProject: (data: string) => Promise<boolean>;
      exportMigrations: (upSql: string, downSql: string) => Promise<boolean>;
      runCommand: (cmd: string) => Promise<{ stdout: string, stderr: string, error?: string }>;
      
      // Project Files
      saveProjectFile: (filePath: string, dataString: string) => Promise<boolean>;
      showSaveDialog: () => Promise<string | null>;
      
      // Global Settings
      getSetting: (key: string) => Promise<any>;
      setSetting: (key: string, value: any) => Promise<boolean>;
      
      // Secure Storage
      saveApiKey: (keyName: string, plainTextKey: string) => Promise<boolean>;
      getApiKey: (keyName: string) => Promise<string | null>;
    }
  }
}
