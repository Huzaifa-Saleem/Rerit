import { ElectronAPI } from '@electron-toolkit/preload'

interface ReritAPI {
  minimizeToTray: () => void
  toggleShortcut: (isActive: boolean) => void
  setMood: (mood: string) => void
  onTextRephrased: (
    callback: (
      event: Electron.IpcRendererEvent,
      data: { original: string; rephrased: string }
    ) => void
  ) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: ReritAPI
  }
}
