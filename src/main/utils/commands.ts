import { exec } from 'child_process'
import Store from 'electron-store'
import { promisify } from 'util'

const execAsync = promisify(exec)
const store = new Store({
  name: 'rerit-settings'
})

/**
 * Opens system accessibility settings on macOS
 */
export function openAccessibilitySettings(): void {
  if (process.platform === 'darwin' && !store.get('accessibility')) {
    exec(`open "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"`)
    store.set('accessibility', true)
  }
}

/**
 * Pastes text using system keyboard shortcuts
 * @returns Promise that resolves when paste operation completes
 */
export async function pasteText(): Promise<void> {
  try {
    if (process.platform === 'darwin') {
      await execAsync(
        `osascript -e 'tell application "System Events" to keystroke "v" using {command down}'`
      )
    } else if (process.platform === 'win32') {
      await execAsync(
        `powershell -command "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys('^v')"`
      )
    }
  } catch (error) {
    console.error('Error pasting text:', error)
  }
}

/**
 * Copies text using system keyboard shortcuts
 * @returns Promise that resolves when copy operation completes
 */
export async function copyText(): Promise<void> {
  try {
    if (process.platform === 'darwin') {
      await execAsync(
        `osascript -e 'tell application "System Events" to keystroke "c" using {command down}'`
      )
    } else if (process.platform === 'win32') {
      await execAsync(
        `powershell -command "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys('^c')"`
      )
    }
  } catch (error) {
    console.error('Error copying text:', error)
  }
}
