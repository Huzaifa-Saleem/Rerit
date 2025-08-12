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
      // Try AXPress paste first (more reliable in some contexts)
      // Fallback to keystroke if Accessibility is not fully granted
      try {
        await execAsync(
          `osascript -e 'tell application "System Events" to keystroke "v" using {command down}'`
        )
      } catch {
        // Retry once after a brief delay
        await new Promise((r) => setTimeout(r, 120))
        await execAsync(
          `osascript -e 'tell application "System Events" to keystroke "v" using {command down}'`
        )
      }
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
      try {
        // Primary: Command+C keystroke
        await execAsync(
          `osascript -e 'tell application "System Events" to keystroke "c" using {command down}'`
        )
      } catch {
        // ignore: keystroke may fail; we'll try menu fallback next
      }

      // Brief delay, then try menu fallback to improve reliability
      await new Promise((r) => setTimeout(r, 120))
      try {
        await execAsync(
          `osascript -e 'tell application "System Events" to tell (first application process whose frontmost is true) to click menu item "Copy" of menu "Edit" of menu bar 1'`
        )
      } catch {
        // ignore: some apps may not expose a standard Edit > Copy menu item
      }
    } else if (process.platform === 'win32') {
      await execAsync(
        `powershell -command "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys('^c')"`
      )
    }
  } catch (error) {
    console.error('Error copying text:', error)
  }
}
