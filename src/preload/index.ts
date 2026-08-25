import { contextBridge, ipcRenderer } from 'electron'

type Unsubscribe = () => void

function on<T>(channel: string, callback: (payload: T) => void): Unsubscribe {
  const listener = (_event: Electron.IpcRendererEvent, payload: T): void => callback(payload)
  ipcRenderer.on(channel, listener)
  return () => ipcRenderer.removeListener(channel, listener)
}

const rerit = {
  auth: {
    getStatus: () => ipcRenderer.invoke('get-auth-status'),
    signIn: () => ipcRenderer.invoke('initiate-login'),
    signOut: () => ipcRenderer.invoke('logout'),
    onSuccess: (callback: (payload: unknown) => void) => on('auth-success', callback),
    onError: (callback: (payload: unknown) => void) => on('auth-error', callback)
  },
  rewrite: {
    getStatus: () => ipcRenderer.invoke('get-rewrite-status'),
    cancel: () => ipcRenderer.invoke('cancel-rewrite'),
    onStatus: (callback: (payload: unknown) => void) => on('rewrite-status', callback)
  },
  preferences: {
    setDefaultAction: (action: string) => ipcRenderer.send('set-tone', action),
    setShortcutActive: (active: boolean) => ipcRenderer.send('toggle-shortcut', active)
  },
  app: {
    runInBackground: () => ipcRenderer.send('minimize-to-tray'),
    quit: () => ipcRenderer.send('quit-app')
  }
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('rerit', rerit)
} else {
  // @ts-ignore fallback for unusual development configurations
  window.rerit = rerit
}
