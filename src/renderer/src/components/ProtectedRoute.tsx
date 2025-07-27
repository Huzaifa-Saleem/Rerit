import { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { useUser } from '@renderer/hooks/useUser'

interface ProtectedRouteProps {
  children: ReactElement
}

export function ProtectedRoute({ children }: ProtectedRouteProps): ReactElement {
  const { loading, isAuthenticated } = useUser()

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />
  }

  return children
}
