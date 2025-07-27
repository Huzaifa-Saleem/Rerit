import { useEffect } from 'react'
import { notificationManager } from '@renderer/components/NotificationSystem'

interface ShortcutNotification {
  type: string
  message: string
  error?: string
}

export function useShortcutNotifications(): void {
  useEffect(() => {
    if (!window.electron?.ipcRenderer) return

    // Handle shortcut success notifications
    const handleShortcutSuccess = (_: any, data: ShortcutNotification) => {
      console.log('Shortcut success:', data)

      switch (data.type) {
        case 'rewrite-complete':
          notificationManager.showSuccess(
            'Text has been rewritten and pasted!',
            '✨ Rewrite Complete'
          )
          break
        default:
          notificationManager.showSuccess(data.message)
      }
    }

    // Handle shortcut error notifications
    const handleShortcutError = (_: any, data: ShortcutNotification) => {
      console.log('Shortcut error:', data)

      switch (data.type) {
        case 'api-error':
          notificationManager.showError(
            'Failed to rewrite text. Check your connection and try again.',
            'Rewrite Failed'
          )
          break
        default:
          notificationManager.showError(data.message, 'Shortcut Error')
      }
    }

    // Handle shortcut info notifications
    const handleShortcutInfo = (_: any, data: ShortcutNotification) => {
      console.log('Shortcut info:', data)

      switch (data.type) {
        case 'no-text':
          notificationManager.showInfo(
            'Please select some text first, then use Cmd+Shift+E (or Ctrl+Shift+E).',
            'No Text Selected'
          )
          break
        case 'auth-required':
          notificationManager.showError(
            'Please sign in to your account first to use the rewrite shortcut.',
            'Authentication Required'
          )
          break
        default:
          notificationManager.showInfo(data.message)
      }
    }

    // Set up IPC listeners
    window.electron.ipcRenderer.on('shortcut-success', handleShortcutSuccess)
    window.electron.ipcRenderer.on('shortcut-error', handleShortcutError)
    window.electron.ipcRenderer.on('shortcut-info', handleShortcutInfo)

    // Cleanup listeners on unmount
    return () => {
      window.electron?.ipcRenderer.removeListener('shortcut-success', handleShortcutSuccess)
      window.electron?.ipcRenderer.removeListener('shortcut-error', handleShortcutError)
      window.electron?.ipcRenderer.removeListener('shortcut-info', handleShortcutInfo)
    }
  }, [])
}
