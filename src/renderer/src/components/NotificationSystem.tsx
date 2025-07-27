import { ReactElement, useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react'

export interface NotificationData {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationProps {
  notification: NotificationData
  onClose: (id: string) => void
}

function Notification({ notification, onClose }: NotificationProps): ReactElement {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10)

    // Auto dismiss
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, notification.duration)

      return () => clearTimeout(timer)
    }

    // Return empty cleanup function if no timer
    return () => {}
  }, [notification.duration])

  const handleClose = (): void => {
    setIsExiting(true)
    setTimeout(() => {
      onClose(notification.id)
    }, 300)
  }

  const getIcon = (): ReactElement => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return <Info className="h-5 w-5 text-gray-600" />
    }
  }

  const getStyles = (): string => {
    const baseStyles = `
      max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto 
      ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300
    `

    if (isExiting) {
      return `${baseStyles} translate-x-full opacity-0`
    }

    if (isVisible) {
      return `${baseStyles} translate-x-0 opacity-100`
    }

    return `${baseStyles} translate-x-full opacity-0`
  }

  const getBorderColor = (): string => {
    switch (notification.type) {
      case 'success':
        return 'border-l-4 border-l-green-500'
      case 'error':
        return 'border-l-4 border-l-red-500'
      case 'warning':
        return 'border-l-4 border-l-amber-500'
      case 'info':
        return 'border-l-4 border-l-blue-500'
      default:
        return 'border-l-4 border-l-gray-500'
    }
  }

  return (
    <div className={getStyles()}>
      <div className={`p-4 ${getBorderColor()}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">{getIcon()}</div>

          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
            <p className="mt-1 text-sm text-gray-500">{notification.message}</p>

            {notification.action && (
              <div className="mt-3">
                <button
                  onClick={notification.action.onClick}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
                >
                  {notification.action.label}
                </button>
              </div>
            )}
          </div>

          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export interface NotificationSystemProps {
  notifications: NotificationData[]
  onClose: (id: string) => void
}

export function NotificationSystem({
  notifications,
  onClose
}: NotificationSystemProps): ReactElement {
  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {notifications.map((notification) => (
          <Notification key={notification.id} notification={notification} onClose={onClose} />
        ))}
      </div>
    </div>
  )
}

// Notification manager class
class NotificationManager {
  private listeners: Set<(notifications: NotificationData[]) => void> = new Set()
  private notifications: NotificationData[] = []

  subscribe(listener: (notifications: NotificationData[]) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener([...this.notifications]))
  }

  show(notification: Omit<NotificationData, 'id'>): string {
    const id = Math.random().toString(36).substring(2, 15)
    const newNotification: NotificationData = {
      ...notification,
      id,
      duration: notification.duration ?? 5000
    }

    this.notifications.push(newNotification)
    this.notify()

    return id
  }

  close(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id)
    this.notify()
  }

  // Predefined notification types for common scenarios
  showQuotaExceeded(currentPlan: string = 'Free'): string {
    return this.show({
      type: 'warning',
      title: 'Daily Quota Exceeded',
      message: `You've reached your daily limit for the ${currentPlan} plan. Upgrade to Pro for 1,000 daily rewrites.`,
      duration: 8000,
      action: {
        label: 'Upgrade to Pro',
        onClick: () => {
          // Handle upgrade action
          console.log('Upgrade clicked')
        }
      }
    })
  }

  showRateLimited(retryAfter?: number): string {
    const message = retryAfter
      ? `Too many requests. Please try again in ${retryAfter} seconds.`
      : 'Too many requests. Please try again in a moment.'

    return this.show({
      type: 'warning',
      title: 'Rate Limited',
      message,
      duration: 6000
    })
  }

  showAuthExpired(): string {
    return this.show({
      type: 'error',
      title: 'Session Expired',
      message: 'Your session has expired. Please sign in again to continue.',
      duration: 0, // Don't auto-dismiss
      action: {
        label: 'Sign In',
        onClick: () => {
          // Handle sign in action
          window.location.hash = '/sign-in'
        }
      }
    })
  }

  showNetworkError(): string {
    return this.show({
      type: 'error',
      title: 'Connection Failed',
      message:
        'Unable to connect to Rerit servers. Please check your internet connection and try again.',
      duration: 7000
    })
  }

  showSuccess(message: string, title: string = 'Success'): string {
    return this.show({
      type: 'success',
      title,
      message,
      duration: 4000
    })
  }

  showError(message: string, title: string = 'Error'): string {
    return this.show({
      type: 'error',
      title,
      message,
      duration: 6000
    })
  }

  showInfo(message: string, title: string = 'Info'): string {
    return this.show({
      type: 'info',
      title,
      message,
      duration: 5000
    })
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager()
