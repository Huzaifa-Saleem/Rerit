import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  authEventManager,
  getAuthStatus,
  logout as authLogout,
  AuthUser,
  AuthSuccessData,
  AuthErrorData
} from '@renderer/config/auth'

interface UseUserReturn {
  user: AuthUser | null
  loading: boolean
  logout: () => Promise<void>
  isAuthenticated: boolean
  error: string | null
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // Check authentication status on mount
  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const authStatus = await getAuthStatus()

      if (authStatus.isAuthenticated && authStatus.user) {
        setUser(authStatus.user)
      } else {
        setUser(null)
        // Only navigate to sign-in if we're not already on auth pages
        const currentPath = window.location.hash.replace('#', '')
        if (currentPath !== '/sign-in' && currentPath !== '/sign-up') {
          navigate('/sign-in')
        }
      }
    } catch (err) {
      console.error('Error checking auth status:', err)
      setError('Failed to check authentication status')
      setUser(null)
      navigate('/sign-in')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  // Handle successful authentication
  const handleAuthSuccess = useCallback(
    (data?: AuthSuccessData | AuthErrorData | undefined) => {
      if (data && 'userId' in data) {
        const newUser: AuthUser = {
          id: data.userId,
          email: data.userEmail,
          name: data.userName,
          avatar: data.userAvatar,
          expiresAt: data.expiresAt
        }
        setUser(newUser)
        setError(null)
        setLoading(false)

        // Show success notification
        showSuccessNotification(`Welcome back, ${data.userName}!`)

        navigate('/')
      }
    },
    [navigate]
  )

  // Handle authentication error
  const handleAuthError = useCallback((data?: AuthSuccessData | AuthErrorData | undefined) => {
    if (data && 'error' in data) {
      setError(data.error || 'Authentication failed')
      setUser(null)
      setLoading(false)
      showErrorNotification(data.error || 'Authentication failed')
    }
  }, [])

  // Handle authentication expiration
  const handleAuthExpired = useCallback(() => {
    setUser(null)
    setError('Your session has expired. Please sign in again.')
    showErrorNotification('Your session has expired. Please sign in again.')
    navigate('/sign-in')
  }, [navigate])

  // Handle authentication initiation
  const handleAuthInitiated = useCallback(() => {
    setLoading(true)
    setError(null)
    showInfoNotification('Opening browser for authentication...')
  }, [])

  // Set up event listeners and check initial auth status
  useEffect(() => {
    // Set up auth event listeners
    authEventManager.on('auth-success', handleAuthSuccess)
    authEventManager.on('auth-error', handleAuthError)
    authEventManager.on('auth-expired', handleAuthExpired)
    authEventManager.on('auth-initiated', handleAuthInitiated)

    // Check initial auth status
    checkAuthStatus()

    // Cleanup event listeners on unmount
    return () => {
      authEventManager.off('auth-success', handleAuthSuccess)
      authEventManager.off('auth-error', handleAuthError)
      authEventManager.off('auth-expired', handleAuthExpired)
      authEventManager.off('auth-initiated', handleAuthInitiated)
    }
  }, [handleAuthSuccess, handleAuthError, handleAuthExpired, handleAuthInitiated, checkAuthStatus])

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      const result = await authLogout()
      if (result.success) {
        setUser(null)
        setError(null)
        showInfoNotification('Logged out successfully')
        navigate('/sign-in')
      } else {
        setError('Failed to logout')
        showErrorNotification('Failed to logout')
      }
    } catch (err) {
      console.error('Error during logout:', err)
      setError('Failed to logout')
      showErrorNotification('Failed to logout')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  return {
    user,
    loading,
    logout,
    isAuthenticated: !!user,
    error
  }
}

// Simple notification system
function showSuccessNotification(message: string): void {
  createNotification(message, 'success')
}

function showErrorNotification(message: string): void {
  createNotification(message, 'error')
}

function showInfoNotification(message: string): void {
  createNotification(message, 'info')
}

function createNotification(message: string, type: 'success' | 'error' | 'info'): void {
  // Create a simple toast notification
  const toast = document.createElement('div')
  toast.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium transform transition-all duration-300 translate-x-full opacity-0`

  // Style based on type
  switch (type) {
    case 'success':
      toast.className += ' bg-green-500'
      break
    case 'error':
      toast.className += ' bg-red-500'
      break
    case 'info':
      toast.className += ' bg-blue-500'
      break
  }

  toast.textContent = message
  document.body.appendChild(toast)

  // Animate in
  setTimeout(() => {
    toast.className = toast.className.replace(
      'translate-x-full opacity-0',
      'translate-x-0 opacity-100'
    )
  }, 10)

  // Animate out and remove
  setTimeout(() => {
    toast.className = toast.className.replace(
      'translate-x-0 opacity-100',
      'translate-x-full opacity-0'
    )
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 4000)
}
