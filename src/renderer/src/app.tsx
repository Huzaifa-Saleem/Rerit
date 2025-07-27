import { ReactElement, useState, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignInPage from './pages/SignIn'
import SignUpPage from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import ToneDashboard from './pages/ToneDashboard'
import { ProtectedRoute } from './components/ProtectedRoute'
import {
  NotificationSystem,
  NotificationData,
  notificationManager
} from './components/NotificationSystem'
import { useShortcutNotifications } from './hooks/useShortcutNotifications'

export default function App(): ReactElement {
  const [notifications, setNotifications] = useState<NotificationData[]>([])

  // Set up shortcut notifications (replaces OS notifications)
  useShortcutNotifications()

  useEffect(() => {
    const unsubscribe = notificationManager.subscribe(setNotifications)
    return unsubscribe
  }, [])

  const handleCloseNotification = (id: string): void => {
    notificationManager.close(id)
  }

  return (
    <>
      <Routes>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tone"
          element={
            <ProtectedRoute>
              <ToneDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <NotificationSystem notifications={notifications} onClose={handleCloseNotification} />
    </>
  )
}
