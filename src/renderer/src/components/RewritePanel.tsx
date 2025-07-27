import { ReactElement, useState, useEffect } from 'react'
import { Button } from './ui/button'
import { TonePicker } from './TonePicker'
import { reritAPI, usageTracker, ApiResult, RewriteResponse } from '@renderer/services/api'
import { useUser } from '@renderer/hooks/useUser'
import { getAuthStatus } from '@renderer/config/auth'
import { notificationManager } from './NotificationSystem'
import { Loader2, Copy, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'

// Helper function to get auth token
async function getAuthToken(): Promise<string | null> {
  try {
    const authStatus = await getAuthStatus()
    // Note: In a real implementation, you'd need to store and retrieve the actual token
    // For now, we'll use a placeholder as the token comes from the server redirect
    return authStatus.isAuthenticated ? 'auth-token-from-server' : null
  } catch {
    return null
  }
}

interface RewritePanelProps {
  initialText?: string
  onRewritten?: (text: string) => void
  className?: string
}

export function RewritePanel({
  initialText = '',
  onRewritten,
  className
}: RewritePanelProps): ReactElement {
  const { user } = useUser()
  const [inputText, setInputText] = useState(initialText)
  const [outputText, setOutputText] = useState('')
  const [selectedTone, setSelectedTone] = useState('professional')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [apiResult, setApiResult] = useState<ApiResult<RewriteResponse> | null>(null)

  useEffect(() => {
    // Load saved tone preference
    const savedTone = localStorage.getItem('rerit-tone')
    if (savedTone) {
      setSelectedTone(savedTone)
    }

    // Load usage data
    usageTracker.loadFromStorage()
  }, [])

  useEffect(() => {
    // Save tone preference when it changes
    localStorage.setItem('rerit-tone', selectedTone)
  }, [selectedTone])

  const handleRewrite = async (): Promise<void> => {
    if (!inputText.trim()) {
      setError('Please enter some text to rewrite')
      return
    }

    if (!user) {
      setError('Please sign in to rewrite text')
      return
    }

    // Check usage limits
    if (!usageTracker.canMakeRequest()) {
      const status = usageTracker.getUsageStatus()
      notificationManager.showQuotaExceeded(status.plan)
      setError(`Daily limit reached (${status.used}/${status.limit}). Please upgrade to continue.`)
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const result = await reritAPI.rewriteText(
        inputText.trim(),
        selectedTone,
        user.id,
        // Get the token from auth credentials stored via IPC
        (await getAuthToken()) || 'fallback-token'
      )

      setApiResult(result)

      if (result.success && result.data) {
        setOutputText(result.data.text)
        setSuccessMessage('Text rewritten successfully!')

        // Show success notification
        notificationManager.showSuccess(
          'Your text has been rewritten successfully!',
          'Rewrite Complete'
        )

        // Update usage tracking
        usageTracker.updateFromResponse(result.data)

        // Call callback if provided
        if (onRewritten) {
          onRewritten(result.data.text)
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        // Handle API errors with notifications
        switch (result.error) {
          case 'auth_expired':
            notificationManager.showAuthExpired()
            setError('Your session has expired. Please sign in again.')
            break
          case 'limit_exceeded':
            notificationManager.showQuotaExceeded()
            setError(result.message || 'Daily limit exceeded. Please upgrade to continue.')
            break
          case 'rate_limited':
            notificationManager.showRateLimited(result.retryAfter)
            setError(result.message || 'Too many requests. Please try again later.')
            break
          case 'validation_error':
            notificationManager.showError(
              result.message || 'Invalid input. Please check your text.',
              'Validation Error'
            )
            setError(result.message || 'Invalid input. Please check your text.')
            break
          case 'network_error':
            notificationManager.showNetworkError()
            setError('Network connection failed. Please try again.')
            break
          default:
            notificationManager.showError(
              result.message || 'Failed to rewrite text. Please try again.'
            )
            setError(result.message || 'Failed to rewrite text. Please try again.')
        }
      }
    } catch (error) {
      console.error('Unexpected error during rewrite:', error)
      notificationManager.showError(
        'An unexpected error occurred. Please try again.',
        'Unexpected Error'
      )
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyOutput = async (): Promise<void> => {
    if (outputText) {
      try {
        await navigator.clipboard.writeText(outputText)
        notificationManager.showSuccess('Text copied to clipboard!', 'Copied')
        setSuccessMessage('Copied to clipboard!')
        setTimeout(() => setSuccessMessage(null), 2000)
      } catch (error) {
        console.error('Failed to copy to clipboard:', error)
        notificationManager.showError(
          'Failed to copy to clipboard. Please try manually selecting and copying the text.'
        )
        setError('Failed to copy to clipboard')
      }
    }
  }

  const handleClearAll = (): void => {
    setInputText('')
    setOutputText('')
    setError(null)
    setSuccessMessage(null)
    setApiResult(null)
  }

  const usageStatus = usageTracker.getUsageStatus()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Usage Status Display */}
      {apiResult?.data?.metadata && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">API Response</span>
            <span className="text-xs text-gray-500">
              {apiResult.data.metadata.processingTimeMs}ms
            </span>
          </div>
          <div className="text-xs text-gray-600">
            Usage: {apiResult.data.metadata.usage.remainingToday}/
            {apiResult.data.metadata.usage.dailyLimit} remaining today
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Text to Rewrite</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your text here..."
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isLoading}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{inputText.length} characters</span>
            <span>Max: 10,000 characters</span>
          </div>
        </div>

        {/* Tone Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose Tone & Style
          </label>
          <TonePicker
            selectedTone={selectedTone}
            onSelectTone={setSelectedTone}
            className="border border-gray-200 rounded-lg p-4"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleRewrite}
            disabled={isLoading || !inputText.trim() || !usageTracker.canMakeRequest()}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rewriting...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Rewrite Text
              </>
            )}
          </Button>

          <Button variant="outline" onClick={handleClearAll} disabled={isLoading}>
            Clear All
          </Button>
        </div>

        {/* Usage Warning */}
        {!usageTracker.canMakeRequest() && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Daily Limit Reached</span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              You&apos;ve used all {usageStatus.limit} rewrites for today. Upgrade to Pro for 1,000
              daily rewrites.
            </p>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Error</span>
          </div>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Success</span>
          </div>
          <p className="text-sm text-green-600 mt-1">{successMessage}</p>
        </div>
      )}

      {/* Output Section */}
      {outputText && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Rewritten Text</label>
              <Button size="sm" variant="outline" onClick={handleCopyOutput} className="text-xs">
                <Copy className="mr-1 h-3 w-3" />
                Copy
              </Button>
            </div>
            <div className="w-full min-h-32 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              <p className="text-gray-900 whitespace-pre-wrap">{outputText}</p>
            </div>
            <div className="text-xs text-gray-500 mt-1">{outputText.length} characters</div>
          </div>
        </div>
      )}
    </div>
  )
}
