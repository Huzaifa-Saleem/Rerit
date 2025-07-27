import React, { ReactElement, useEffect, useState } from 'react'
import { Button } from './ui/button'
import { cn } from '../lib/utils'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@renderer/hooks/useUser'

function LoginForm({ className, ...props }: React.ComponentProps<'div'>): ReactElement {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()

  useEffect(() => {
    if (user?.id) {
      navigate('/')
    }
  }, [user, navigate])

  const handleGoogleLogin = async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      // Open Google auth in external browser using shell.openExternal
      const deviceName = `${window.navigator.userAgent.split(' ')[0]}-desktop`
      const authUrl = `${import.meta.env.VITE_API_URL}/api/auth/electron/callback?source=electron&device=${encodeURIComponent(deviceName)}`

      // Call the main process to open external browser
      if (window.electron) {
        await window.electron.ipcRenderer.invoke('open-external-auth', authUrl)
      } else {
        // Fallback for development
        window.open(authUrl, '_blank')
      }
    } catch (error) {
      console.error('Error opening Google auth:', error)
      setError('Failed to open Google login. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('relative z-10 flex flex-col gap-6', className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Sign in with Google to continue to Rerit
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="grid gap-6">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          type="button"
        >
          {isLoading ? 'Opening Google Sign In...' : 'Sign in with Google'}
        </Button>
      </div>

      <div className="text-center text-sm">
        Don&apos;t have an account?{' '}
        <a
          href="#"
          className="underline underline-offset-4"
          onClick={(e) => {
            e.preventDefault()
            navigate('/sign-up')
          }}
        >
          Sign up
        </a>
      </div>
    </div>
  )
}

export { LoginForm }
