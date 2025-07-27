// External authentication configuration and utilities
// Browser-based authentication with deep linking for Electron apps

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar?: string
  expiresAt?: string
}

export interface AuthCredentials {
  userId: string
  token: string
  expiresAt?: string
  userName: string
  userEmail: string
  userAvatar?: string
}

export interface AuthResult {
  success: boolean
  user?: AuthUser
  error?: string
}

// Auth event types for IPC communication
export type AuthEventType = 'auth-success' | 'auth-error' | 'auth-expired' | 'auth-initiated'

// Function to initiate external authentication
export const initiateExternalAuth = async (): Promise<void> => {
  if (!window.electron) {
    throw new Error('Electron context not available')
  }

  try {
    await window.electron.ipcRenderer.invoke('initiate-login')
  } catch (error) {
    console.error('Failed to initiate external auth:', error)
    throw error
  }
}

// Function to get current auth status
export const getAuthStatus = async (): Promise<{
  isAuthenticated: boolean
  user: AuthUser | null
}> => {
  if (!window.electron) {
    return { isAuthenticated: false, user: null }
  }

  try {
    return await window.electron.ipcRenderer.invoke('get-auth-status')
  } catch (error) {
    console.error('Failed to get auth status:', error)
    return { isAuthenticated: false, user: null }
  }
}

// Function to logout
export const logout = async (): Promise<{ success: boolean }> => {
  if (!window.electron) {
    return { success: false }
  }

  try {
    return await window.electron.ipcRenderer.invoke('logout')
  } catch (error) {
    console.error('Failed to logout:', error)
    return { success: false }
  }
}

// Event data types
export interface AuthSuccessData {
  userId: string
  userName: string
  userEmail: string
  userAvatar?: string
  expiresAt?: string
}

export interface AuthErrorData {
  error: string
  message?: string
}

// Auth event listeners
export class AuthEventManager {
  private static instance: AuthEventManager | null = null
  private listeners: Map<
    AuthEventType,
    Set<(data?: AuthSuccessData | AuthErrorData | undefined) => void>
  > = new Map()

  private constructor() {
    if (window.electron) {
      // Set up IPC listeners for auth events
      window.electron.ipcRenderer.on('auth-success', (_, data: AuthSuccessData) => {
        this.emit('auth-success', data)
      })

      window.electron.ipcRenderer.on('auth-error', (_, error: AuthErrorData) => {
        this.emit('auth-error', error)
      })

      window.electron.ipcRenderer.on('auth-expired', () => {
        this.emit('auth-expired')
      })

      window.electron.ipcRenderer.on('auth-initiated', () => {
        this.emit('auth-initiated')
      })
    }
  }

  public static getInstance(): AuthEventManager {
    if (!AuthEventManager.instance) {
      AuthEventManager.instance = new AuthEventManager()
    }
    return AuthEventManager.instance
  }

  public on(
    event: AuthEventType,
    callback: (data?: AuthSuccessData | AuthErrorData | undefined) => void
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  public off(
    event: AuthEventType,
    callback: (data?: AuthSuccessData | AuthErrorData | undefined) => void
  ): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(callback)
    }
  }

  private emit(event: AuthEventType, data?: AuthSuccessData | AuthErrorData | undefined): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data))
    }
  }

  public removeAllListeners(): void {
    this.listeners.clear()
  }
}

// Singleton instance
export const authEventManager = AuthEventManager.getInstance()
