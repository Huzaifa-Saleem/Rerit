import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  globalShortcut,
  clipboard,
  Tray,
  Menu,
  nativeImage,
  safeStorage,
  Notification
} from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createWindow } from './createWindow'
import { URL } from 'url'
import { join } from 'path'
import { copyText, pasteText } from './utils/commands'
import axios from 'axios'
import Store from 'electron-store'
import os from 'os'

// Simple logging function
function log(message: string): void {
  console.log(message)
}

// Development-only logger for verbose diagnostics
const isDevelopmentEnvironment: boolean = !app.isPackaged
function debugLog(message: string): void {
  if (isDevelopmentEnvironment) {
    console.log(message)
  }
}

const store = new Store({
  name: 'rerit-store'
})

// Create separate store for auth credentials
const authStore = new Store({
  name: 'rerit-auth',
  encryptionKey: 'rerit-secure-auth-key-2024'
})

// Store references to windows and tray
let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isShortcutRegistered = false
let isAppQuitting = false

// Authentication interfaces
interface AuthCredentials {
  userId: string
  token: string
  expiresAt?: string
  userName: string
  userEmail: string
  userAvatar?: string
  storedAt: string
  encrypted: boolean
}

interface AuthUser {
  id: string
  email: string
  name: string
  avatar?: string
  expiresAt?: string
}

// Authentication utility functions
function storeAuthCredentials(credentials: Omit<AuthCredentials, 'storedAt' | 'encrypted'>): void {
  try {
    // Encrypt sensitive data if safeStorage is available
    if (safeStorage.isEncryptionAvailable()) {
      const encryptedToken = safeStorage.encryptString(credentials.token)
      authStore.set('auth', {
        userId: credentials.userId,
        token: encryptedToken.toString('base64'),
        encrypted: true,
        expiresAt: credentials.expiresAt,
        userName: credentials.userName,
        userEmail: credentials.userEmail,
        userAvatar: credentials.userAvatar,
        storedAt: new Date().toISOString()
      })
    } else {
      // Fallback to unencrypted storage (not recommended for production)
      authStore.set('auth', {
        ...credentials,
        encrypted: false,
        storedAt: new Date().toISOString()
      })
    }

    log('Authentication credentials stored securely')
  } catch (error) {
    console.error('Failed to store credentials:', error)
  }
}

function getStoredCredentials(): AuthCredentials | null {
  try {
    const auth = authStore.get('auth') as AuthCredentials | undefined
    if (!auth) return null

    // Check if token is expired
    if (auth.expiresAt && new Date(auth.expiresAt) < new Date()) {
      clearAuthCredentials()
      return null
    }

    // Decrypt token if it was encrypted
    if (auth.encrypted && safeStorage.isEncryptionAvailable()) {
      const encryptedBuffer = Buffer.from(auth.token, 'base64')
      const decryptedToken = safeStorage.decryptString(encryptedBuffer)
      return {
        ...auth,
        token: decryptedToken
      }
    }

    return auth
  } catch (error) {
    console.error('Error retrieving credentials:', error)
    return null
  }
}

function clearAuthCredentials(): void {
  authStore.delete('auth')
  log('Authentication credentials cleared')
}

// Deep link handler
function handleDeepLink(url: string): void {
  log(`Deep link received: ${url}`)

  try {
    const parsedUrl = new URL(url)

    if (
      parsedUrl.protocol === 'rerit:' &&
      parsedUrl.hostname === 'auth' &&
      parsedUrl.pathname === '/success'
    ) {
      const userId = parsedUrl.searchParams.get('userId')
      const token = parsedUrl.searchParams.get('token')
      const expiresAt = parsedUrl.searchParams.get('expiresAt')
      const userName = parsedUrl.searchParams.get('userName')
      const userEmail = parsedUrl.searchParams.get('userEmail')
      const userAvatar = parsedUrl.searchParams.get('userAvatar')

      if (userId && token && userName && userEmail) {
        // Store credentials securely
        storeAuthCredentials({
          userId,
          token,
          expiresAt: expiresAt || undefined,
          userName,
          userEmail,
          userAvatar: userAvatar || undefined
        })

        // Ensure main window exists and is ready
        if (mainWindow && mainWindow.webContents) {
          // Wait a moment to ensure renderer is ready
          setTimeout(() => {
            mainWindow!.webContents.send('auth-success', {
              userId,
              userName,
              userEmail,
              userAvatar,
              expiresAt
            })
          }, 100)

          // Show and focus the main window
          if (mainWindow.isMinimized()) {
            mainWindow.restore()
          }

          if (!mainWindow.isVisible()) {
            mainWindow.show()
          }

          mainWindow.focus()
        }
      } else {
        if (mainWindow) {
          mainWindow.webContents.send('auth-error', {
            error: 'Missing authentication data'
          })
        }
      }
    }
  } catch (error) {
    console.error('Error handling deep link:', error)

    // Notify renderer about auth error
    if (mainWindow) {
      mainWindow.webContents.send('auth-error', {
        error: 'Failed to process authentication'
      })
    }
  }
}

// Initiate login function
function initiateLogin(): void {
  const deviceName = `${os.hostname()}-${os.platform()}`
  // Use environment variable or fallback to localhost for development
  const apiUrl = process.env.VITE_API_URL || 'https://rerit.vercel.app'
  const authUrl = `${apiUrl}/api/auth/electron/callback?source=electron&device=${encodeURIComponent(deviceName)}`

  log(`Opening auth URL: ${authUrl}`)

  // Open the authentication URL in the user's default browser
  shell.openExternal(authUrl)

  // Notify renderer that auth was initiated
  if (mainWindow) {
    mainWindow.webContents.send('auth-initiated')
  }
}

// Register protocol for deep links
log('Registering rerit:// protocol...')
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    const success = app.setAsDefaultProtocolClient('rerit', process.execPath, [process.argv[1]])
    log(`Protocol registration (dev mode): ${success ? 'Success' : 'Failed'}`)
  }
} else {
  const success = app.setAsDefaultProtocolClient('rerit')
  log(`Protocol registration (production): ${success ? 'Success' : 'Failed'}`)
}

// Handle deep links on macOS
app.on('open-url', (event, url) => {
  event.preventDefault()
  handleDeepLink(url)
})

// Function to register the global shortcut
const registerGlobalShortcut = (): void => {
  if (isShortcutRegistered) return

  debugLog('Registering global shortcut: CommandOrControl+Shift+E')

  // Register the global shortcut (Cmd+Shift+E or Ctrl+Shift+E)
  const shortcutRegistered = globalShortcut.register('CommandOrControl+Shift+E', async () => {
    debugLog('Shortcut triggered: CommandOrControl+Shift+E')

    try {
      // Copy the selected text
      const previousClipboardText = clipboard.readText()
      await copyText()

      // Poll the clipboard briefly until we detect new content
      let originalText = ''
      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 120))
        const current = clipboard.readText()
        if (current && current.trim() !== '' && current !== previousClipboardText) {
          originalText = current
          break
        }
      }
      if (!originalText) {
        originalText = clipboard.readText()
      }
      console.log('COPY:', originalText)

      if (!originalText || originalText.trim() === '') {
        log('No text selected or copied to clipboard')

        // Show native Electron notification
        if (Notification.isSupported()) {
          new Notification({
            title: 'Rerit',
            body: 'No text selected or permission missing. Select text and try again, and ensure Rerit has Accessibility permission in System Settings.'
          }).show()
        }
        return
      }

      const tone = store.get('tone')

      // Get stored credentials for API authentication
      const credentials = getStoredCredentials()
      if (!credentials) {
        log('No credentials found for API request')

        // Show native Electron notification
        if (Notification.isSupported()) {
          new Notification({
            title: 'Rerit - Authentication Required',
            body: 'Please sign in to your account first to use the rewrite shortcut.'
          }).show()
        }
        return
      }

      // Make authenticated API request
      const apiUrl =
        (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ||
        process.env.VITE_API_URL ||
        'http://localhost:3000'
      const response = await axios.post(
        `${apiUrl}/api/rewrite`,
        {
          text: originalText,
          tone: tone || 'professional'
        },
        {
          headers: {
            Authorization: `Electron ${credentials.userId}:${credentials.token}`,
            'Content-Type': 'application/json',
            'User-Agent': `ReritApp/1.0.0 (${process.platform})`
          }
        }
      )

      const data = response.data
      console.log('API:', typeof data?.text === 'string' ? data.text : '')

      if (!data.text) {
        console.log('No text returned from API')
        return
      }

      // Write the rephrased text to clipboard
      clipboard.writeText(data.text)

      // Wait for the clipboard write to complete before pasting
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Paste the rephrased text
      await pasteText()
      console.log('PASTE:', data.text)

      // Show native success notification
      if (Notification.isSupported()) {
        new Notification({
          title: '✨ Rewrite Complete',
          body: 'Text has been rewritten and pasted successfully!',
          silent: true
        }).show()
      }

      // Notify the main window about the rephrasing (for logging/analytics)
      if (mainWindow && mainWindow.webContents) {
        debugLog('Notifying main window about rephrased text')
        mainWindow.webContents.send('text-rephrased', {
          original: originalText,
          rephrased: data.text
        })
      }
    } catch (error: unknown) {
      let apiErrorPayload: unknown = error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown } }
        if (axiosError.response?.data !== undefined) {
          apiErrorPayload = axiosError.response.data
        }
      }
      console.error('API_ERROR:', apiErrorPayload)

      // Show native error notification
      if (Notification.isSupported()) {
        let errorMessage = 'Failed to rewrite text. Please try again.'

        // Customize error message based on error type
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number; data?: { error?: string } } }
          if (axiosError.response?.status === 401) {
            errorMessage = 'Authentication expired. Please sign in again.'
          } else if (axiosError.response?.status === 429) {
            errorMessage = 'Rate limit exceeded. Please try again later.'
          } else if (axiosError.response?.data?.error) {
            errorMessage = axiosError.response.data.error
          }
        }

        new Notification({
          title: 'Rerit - Error',
          body: errorMessage
        }).show()
      }
    }
  })

  isShortcutRegistered = shortcutRegistered

  if (!shortcutRegistered) {
    console.error('Failed to register global shortcut')
  } else {
    log('Global shortcut registered successfully')
  }
}

// Function to unregister the global shortcut
const unregisterGlobalShortcut = (): void => {
  globalShortcut.unregister('CommandOrControl+Shift+E')
  isShortcutRegistered = false
}

// Function to create the tray icon
const createTray = (): void => {
  if (tray) return

  // Create tray icon
  const icon = nativeImage.createFromPath(join(__dirname, '../../resources/trayIcon.png'))
  tray = new Tray(icon.resize({ width: 16, height: 16 }))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Rerit is Active',
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Show Dashboard',
      click: () => {
        if (mainWindow) {
          if (process.platform === 'darwin') {
            app.dock?.show()
          }
          mainWindow.show()
          mainWindow.focus()
        }
      }
    },
    {
      label: 'Disable Shortcut',
      click: () => {
        unregisterGlobalShortcut()
        updateTrayMenu(false)
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setToolTip('Rerit - Text Rephrasing')
  tray.setContextMenu(contextMenu)
}

// Function to update the tray menu based on shortcut status
const updateTrayMenu = (isActive: boolean): void => {
  if (!tray) return

  const contextMenu = Menu.buildFromTemplate([
    {
      label: isActive ? 'Rerit is Active' : 'Rerit is Inactive',
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Show Dashboard',
      click: () => {
        if (mainWindow) {
          if (process.platform === 'darwin') {
            app.dock?.show()
          }
          mainWindow.show()
          mainWindow.focus()
        }
      }
    },
    {
      label: isActive ? 'Disable Shortcut' : 'Enable Shortcut',
      click: () => {
        if (isActive) {
          unregisterGlobalShortcut()
        } else {
          registerGlobalShortcut()
        }
        updateTrayMenu(!isActive)
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        // Properly quit the app
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.rerit.app')

  // F12 or Ctrl+R to open devtools
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Handle external links
  app.on('web-contents-created', (_, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
      // Open all external links in the default browser
      shell.openExternal(url)
      return { action: 'deny' }
    })
  })

  // Create the main window
  mainWindow = createWindow()

  // On macOS: keep Dock visible only while the window is visible
  if (process.platform === 'darwin' && mainWindow) {
    app.dock?.show()
    mainWindow.on('show', () => {
      app.dock?.show()
    })
    mainWindow.on('hide', () => {
      app.dock?.hide()
    })
  }

  // Set up authentication IPC handlers
  ipcMain.handle('initiate-login', () => {
    initiateLogin()
  })

  ipcMain.handle('open-external-auth', (_event, url: string) => {
    shell.openExternal(url)
  })

  ipcMain.handle('get-auth-status', () => {
    const credentials = getStoredCredentials()
    if (credentials) {
      const user: AuthUser = {
        id: credentials.userId,
        name: credentials.userName,
        email: credentials.userEmail,
        avatar: credentials.userAvatar,
        expiresAt: credentials.expiresAt
      }
      return {
        isAuthenticated: true,
        user
      }
    }
    return {
      isAuthenticated: false,
      user: null
    }
  })

  ipcMain.handle('logout', () => {
    clearAuthCredentials()
    return { success: true }
  })

  // Set up IPC handlers
  ipcMain.on('quit-app', () => {
    // Allow renderer to request a full quit
    isAppQuitting = true
    app.quit()
  })

  ipcMain.on('minimize-to-tray', () => {
    if (!mainWindow) return

    // Create tray if it doesn't exist
    createTray()

    // Register global shortcut
    registerGlobalShortcut()

    // Update tray menu
    updateTrayMenu(true)

    // Hide the window
    mainWindow.hide()
    if (process.platform === 'darwin') {
      app.dock?.hide()
    }
  })

  // Toggle shortcut status
  ipcMain.on('toggle-shortcut', (_, isActive) => {
    if (isActive) {
      registerGlobalShortcut()
    } else {
      unregisterGlobalShortcut()
    }

    updateTrayMenu(isActive)
  })

  // Set tone in electron store
  ipcMain.on('set-tone', (_, tone) => {
    store.set('tone', tone)
    log(`Tone set in electron store: ${tone}`)
  })

  app.on('activate', function () {
    // create window if not exists
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow()
    }
  })
})

// Handle deep links on Windows
if (process.platform === 'win32') {
  const gotTheLock = app.requestSingleInstanceLock()

  if (!gotTheLock) {
    app.quit()
  } else {
    app.on('second-instance', (_, commandLine) => {
      // Someone tried to run a second instance, we should focus our window.
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()

        // Process deep link
        const url = commandLine.find((arg) => arg.startsWith('rerit://'))
        if (url) {
          handleDeepLink(url)
        }
      }
    })
  }
}

// Clean up when app is quitting
app.on('will-quit', () => {
  log('App is quitting, cleaning up...')

  // Unregister all shortcuts
  globalShortcut.unregisterAll()

  // Destroy tray
  if (tray) {
    tray.destroy()
    tray = null
  }
})

// Handle app activation (important for preventing accidental closure)
app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow()
  } else if (mainWindow) {
    if (process.platform === 'darwin') {
      app.dock?.show()
    }
    mainWindow.show()
    mainWindow.focus()
  }
})

// Handle explicit quit commands (Cmd+Q, etc.)
app.on('before-quit', () => {
  log('User initiated quit - allowing app to close')
  isAppQuitting = true
})

// Add protection against accidental window closure
app.on('browser-window-created', (_, window) => {
  // Handle window close attempt
  window.on('close', (event) => {
    if (process.platform === 'darwin' && !isAppQuitting) {
      // On macOS, hide instead of close (unless app is quitting)
      event.preventDefault()
      window.hide()
      app.dock?.hide()
      createTray() // Ensure tray is available
    }
  })
})

// Handle window closure - keep app running for global shortcuts unless quitting
app.on('window-all-closed', () => {
  if (isAppQuitting) {
    // If user explicitly quit, allow app to close
    return
  }

  // On macOS, apps commonly stay running when all windows are closed
  // On other platforms, we also want to keep running for global shortcuts
  if (process.platform !== 'darwin') {
    // On Windows/Linux, only keep running if we have global shortcuts active
    if (isShortcutRegistered) {
      log('All windows closed, but keeping app running for global shortcuts')
      createTray() // Ensure tray is available
    } else {
      app.quit()
    }
  } else {
    // On macOS, always keep running (unless explicitly quitting)
    if (process.platform === 'darwin') {
      app.dock?.hide()
    }
    log('All windows closed, but keeping app running for global shortcuts')
    createTray()
  }
})
