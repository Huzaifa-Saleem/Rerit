import { is } from '@electron-toolkit/utils'
import { BrowserWindow, screen } from 'electron'
import { join } from 'path'

const WIDTH = 286
const HEIGHT = 58

export function createStatusWindow(): BrowserWindow {
  const statusWindow = new BrowserWindow({
    width: WIDTH,
    height: HEIGHT,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    alwaysOnTop: true,
    focusable: false,
    skipTaskbar: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  statusWindow.setAlwaysOnTop(true, 'floating')
  statusWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  statusWindow.setIgnoreMouseEvents(true)

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    statusWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?surface=status`)
  } else {
    statusWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      query: { surface: 'status' }
    })
  }

  return statusWindow
}

export function positionStatusWindow(statusWindow: BrowserWindow): void {
  const cursor = screen.getCursorScreenPoint()
  const display = screen.getDisplayNearestPoint(cursor)
  const { x, y, width } = display.workArea

  statusWindow.setPosition(Math.round(x + (width - WIDTH) / 2), y + 22, false)
}
