interface AuthUser {
  id: string
  email: string
  name: string
  avatar?: string
  expiresAt?: string
}

interface AuthStatus {
  isAuthenticated: boolean
  user: AuthUser | null
}

interface RewriteStatus {
  operationId: number
  stage: 'capturing' | 'requesting' | 'applying' | 'completed' | 'cancelled' | 'failed'
  elapsedMs: number
  message?: string
}

interface ReritBridge {
  auth: {
    getStatus: () => Promise<AuthStatus>
    signIn: () => Promise<void>
    signOut: () => Promise<{ success: boolean }>
    onSuccess: (callback: (payload: unknown) => void) => () => void
    onError: (callback: (payload: unknown) => void) => () => void
  }
  rewrite: {
    getStatus: () => Promise<RewriteStatus | null>
    cancel: () => Promise<{ success: boolean }>
    onStatus: (callback: (payload: RewriteStatus) => void) => () => void
  }
  preferences: {
    setDefaultAction: (action: string) => void
    setShortcutActive: (active: boolean) => void
  }
  app: {
    runInBackground: () => void
    quit: () => void
  }
}

declare global {
  interface Window {
    rerit: ReritBridge
  }
}

export {}
