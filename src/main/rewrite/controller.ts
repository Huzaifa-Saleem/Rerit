import { clipboard } from 'electron'
import { copyText, pasteText } from '../utils/commands'

export interface RewriteCredentials {
  userId: string
  token: string
}

export type RewriteStage =
  | 'capturing'
  | 'requesting'
  | 'applying'
  | 'completed'
  | 'cancelled'
  | 'failed'

export interface RewriteStatus {
  operationId: number
  stage: RewriteStage
  elapsedMs: number
  message?: string
}

interface RewriteControllerOptions {
  getCredentials: () => RewriteCredentials | null
  getAction: () => string
  getApiUrl: () => string
  onStatus: (status: RewriteStatus) => void
}

interface ClipboardSnapshot {
  text: string
  html: string
  rtf: string
  image: Electron.NativeImage
}

const CAPTURE_TIMEOUT_MS = 300
const CAPTURE_POLL_MS = 12
const CLIPBOARD_RESTORE_DELAY_MS = 140

function wait(duration: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, duration))
}

function snapshotClipboard(): ClipboardSnapshot {
  return {
    text: clipboard.readText(),
    html: clipboard.readHTML(),
    rtf: clipboard.readRTF(),
    image: clipboard.readImage()
  }
}

function restoreClipboard(snapshot: ClipboardSnapshot): void {
  clipboard.write({
    text: snapshot.text,
    html: snapshot.html || undefined,
    rtf: snapshot.rtf || undefined,
    image: snapshot.image.isEmpty() ? undefined : snapshot.image
  })
}

export class RewriteController {
  private activeOperation: {
    id: number
    abortController: AbortController
    startedAt: number
  } | null = null
  private nextOperationId = 1

  constructor(private readonly options: RewriteControllerOptions) {}

  cancel(): void {
    if (!this.activeOperation) return

    const { id, abortController, startedAt } = this.activeOperation
    abortController.abort()
    this.activeOperation = null
    this.emit(id, 'cancelled', startedAt, 'Rewrite cancelled')
  }

  async run(): Promise<void> {
    this.cancel()

    const operationId = this.nextOperationId++
    const abortController = new AbortController()
    const startedAt = performance.now()
    const clipboardSnapshot = snapshotClipboard()
    const sentinel = `rerit-selection-${operationId}-${crypto.randomUUID()}`
    let clipboardOwnerText = sentinel
    this.activeOperation = { id: operationId, abortController, startedAt }

    try {
      this.emit(operationId, 'capturing', startedAt)
      const selectedText = await this.captureSelection(abortController.signal, sentinel)
      clipboardOwnerText = selectedText || sentinel

      if (!selectedText.trim()) {
        restoreClipboard(clipboardSnapshot)
        throw new Error('Select text first')
      }

      const credentials = this.options.getCredentials()
      if (!credentials) {
        restoreClipboard(clipboardSnapshot)
        throw new Error('Sign in to use Rerit')
      }

      this.assertCurrent(operationId)
      this.emit(operationId, 'requesting', startedAt)

      const response = await fetch(`${this.options.getApiUrl()}/api/rewrite`, {
        method: 'POST',
        headers: {
          Authorization: `Electron ${credentials.userId}:${credentials.token}`,
          'Content-Type': 'application/json',
          'User-Agent': `ReritApp/2.0.0 (${process.platform})`
        },
        body: JSON.stringify({
          text: selectedText,
          tone: this.options.getAction()
        }),
        signal: abortController.signal
      })

      if (!response.ok) {
        throw new Error(await this.getResponseError(response))
      }

      const result = (await response.json()) as { text?: string }
      if (!result.text?.trim()) {
        throw new Error('Rerit returned an empty result')
      }

      this.assertCurrent(operationId)
      this.emit(operationId, 'applying', startedAt)
      clipboard.writeText(result.text)
      clipboardOwnerText = result.text
      await pasteText()

      this.assertCurrent(operationId)
      this.activeOperation = null
      this.emit(operationId, 'completed', startedAt)

      setTimeout(() => {
        if (clipboard.readText() === result.text) {
          restoreClipboard(clipboardSnapshot)
        }
      }, CLIPBOARD_RESTORE_DELAY_MS)
    } catch (error) {
      if (clipboard.readText() === clipboardOwnerText) {
        restoreClipboard(clipboardSnapshot)
      }

      if (abortController.signal.aborted) return
      if (this.activeOperation?.id === operationId) this.activeOperation = null

      const message = error instanceof Error ? error.message : 'Rewrite failed'
      this.emit(operationId, 'failed', startedAt, message)
    }
  }

  private async captureSelection(signal: AbortSignal, sentinel: string): Promise<string> {
    clipboard.writeText(sentinel)
    await copyText()

    const deadline = performance.now() + CAPTURE_TIMEOUT_MS
    while (performance.now() < deadline) {
      if (signal.aborted) throw new DOMException('Cancelled', 'AbortError')

      const current = clipboard.readText()
      if (current !== sentinel) return current
      await wait(CAPTURE_POLL_MS)
    }

    return ''
  }

  private assertCurrent(operationId: number): void {
    if (this.activeOperation?.id !== operationId) {
      throw new DOMException('Stale rewrite', 'AbortError')
    }
  }

  private emit(
    operationId: number,
    stage: RewriteStage,
    startedAt: number,
    message?: string
  ): void {
    this.options.onStatus({
      operationId,
      stage,
      elapsedMs: Math.round(performance.now() - startedAt),
      message
    })
  }

  private async getResponseError(response: Response): Promise<string> {
    try {
      const payload = (await response.json()) as { error?: string; message?: string }
      return payload.message || payload.error || `Rewrite failed (${response.status})`
    } catch {
      return `Rewrite failed (${response.status})`
    }
  }
}
