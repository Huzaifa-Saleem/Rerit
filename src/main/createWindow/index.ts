import { is } from '@electron-toolkit/utils'
import { BrowserWindow, shell, screen } from 'electron'
import { join } from 'path'
import icon from '../../../resources/appIcon.png?asset'

export function createWindow(): BrowserWindow {
  // Get primary display dimensions
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width } = primaryDisplay.workAreaSize

  // Create the browser window with optimized dimensions
  const mainWindow = new BrowserWindow({
    width: Math.min(1280, width * 0.8),
    height: 850,
    minWidth: 1000,
    minHeight: 800,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#ffffff',
    icon: icon, // Apply icon to all platforms
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // Center the window
  mainWindow.center()

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Save window position and size on close
  mainWindow.on('close', () => {
    const bounds = mainWindow.getBounds()
    const isMaximized = mainWindow.isMaximized()

    // You could save these to electron-store or similar
    console.log('Window bounds:', bounds, 'Maximized:', isMaximized)
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])

    // Open DevTools in development mode
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}
