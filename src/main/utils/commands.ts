import { exec } from 'child_process'
import Store from 'electron-store'
import { keyboard, Key } from '@nut-tree/nut-js'
const store = new Store({
  name: 'rerit-settings'
})

/**
 * Opens system accessibility settings on macOS
 */
export function openAccessibilitySettings(): void {
  if (process.platform !== 'darwin') return
  // Only prompt user if not already granted and not previously shown
  const hasPrompted = Boolean(store.get('accessibilityPrompted'))
  if (!hasPrompted) {
    exec(`open "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"`)
    store.set('accessibilityPrompted', true)
  }
}

/**
 * Pastes text using system keyboard shortcuts
 * @returns Promise that resolves when paste operation completes
 */
export async function pasteText(): Promise<void> {
  try {
    if (process.platform === 'darwin') {
      // Use native keyboard driver instead of AppleScript in production
      await keyboard.pressKey(Key.LeftSuper, Key.V)
      await keyboard.releaseKey(Key.LeftSuper, Key.V)
    } else if (process.platform === 'win32') {
      // Use native keyboard driver (nut.js) on Windows as well
      await keyboard.pressKey(Key.LeftControl, Key.V)
      await keyboard.releaseKey(Key.LeftControl, Key.V)
    } else if (process.platform === 'linux') {
      // Linux: use native keyboard driver (nut.js)
      await keyboard.pressKey(Key.LeftControl, Key.V)
      await keyboard.releaseKey(Key.LeftControl, Key.V)
    }
  } catch (error) {
    console.error('Error pasting text:', error)
    throw error
  }
}

/**
 * Copies text using system keyboard shortcuts
 * @returns Promise that resolves when copy operation completes
 */
export async function copyText(): Promise<void> {
  try {
    if (process.platform === 'darwin') {
      await keyboard.pressKey(Key.LeftSuper, Key.C)
      await keyboard.releaseKey(Key.LeftSuper, Key.C)
    } else if (process.platform === 'win32') {
      await keyboard.pressKey(Key.LeftControl, Key.C)
      await keyboard.releaseKey(Key.LeftControl, Key.C)
    } else if (process.platform === 'linux') {
      // Linux: use native keyboard driver (nut.js)
      await keyboard.pressKey(Key.LeftControl, Key.C)
      await keyboard.releaseKey(Key.LeftControl, Key.C)
    }
  } catch (error) {
    console.error('Error copying text:', error)
    throw error
  }
}
