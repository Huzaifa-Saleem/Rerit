import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Minimize to tray and activate shortcut
  minimizeToTray: (): void => {
    ipcRenderer.send('minimize-to-tray')
  },

  // Toggle global shortcut
  toggleShortcut: (isActive: boolean): void => {
    ipcRenderer.send('toggle-shortcut', isActive)
  },

  // Set mood in electron store
  setMood: (mood: string): void => {
    ipcRenderer.send('set-mood', mood)
  },

  // Listen for text rephrasing events
  onTextRephrased: (
    callback: (
      event: Electron.IpcRendererEvent,
      data: { original: string; rephrased: string }
    ) => void
  ): (() => void) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      data: { original: string; rephrased: string }
    ): void => {
      callback(_event, data)
    }

    ipcRenderer.on('text-rephrased', listener)

    // Return a function to remove the listener
    return (): void => {
      ipcRenderer.removeListener('text-rephrased', listener)
    }
  }
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
