import { ReactElement, useEffect } from 'react'
import { useUser } from '@renderer/hooks/useUser'
import { RewritePanel } from '@renderer/components/RewritePanel'
import { Button } from '@renderer/components/ui/button'
import { usageTracker } from '@renderer/services/api'
import { LogOut, Settings, Crown } from 'lucide-react'

export default function ToneDashboard(): ReactElement {
  const { user, logout } = useUser()

  useEffect(() => {
    // Load usage data when dashboard opens
    usageTracker.loadFromStorage()
  }, [])

  const usageStatus = usageTracker.getUsageStatus()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Rerit
              </span>
            </div>
            <div className="text-sm text-gray-500">•</div>
            <div className="text-sm text-gray-600">Tone Dashboard</div>
          </div>

          <div className="flex items-center gap-4">
            {/* Usage Status */}
            <div className="flex items-center gap-2 text-sm">
              <Crown className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{usageStatus.plan}</span>
              <span className="text-gray-500">
                {usageStatus.remaining}/{usageStatus.limit} left
              </span>
            </div>

            {/* User Info */}
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={logout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-600">
              Transform your text with AI-powered tone adjustments. Choose from professional styles
              to creative expressions.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{usageStatus.used}</div>
              <div className="text-sm text-gray-600">Rewrites Today</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-green-600">{usageStatus.remaining}</div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-purple-600">{usageStatus.percentUsed}%</div>
              <div className="text-sm text-gray-600">Usage Today</div>
            </div>
          </div>

          {/* Main Rewrite Panel */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Text Rewriter</h2>
              <p className="text-sm text-gray-600 mt-1">
                Enter your text below and choose a tone to transform your writing style.
              </p>
            </div>

            <div className="p-6">
              <RewritePanel />
            </div>
          </div>

          {/* Pro Upgrade CTA */}
          {usageStatus.plan === 'Free' && usageStatus.percentUsed > 50 && (
            <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white text-center">
              <h3 className="text-xl font-bold mb-2">Ready for More?</h3>
              <p className="mb-4 opacity-90">
                Upgrade to Pro for 1,000 daily rewrites, advanced features, and priority support.
              </p>
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
