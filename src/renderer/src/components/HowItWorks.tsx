import { ReactElement } from 'react'
import { Button } from './ui/button'
import { Zap, MousePointer, Keyboard, ClipboardCheck } from 'lucide-react'

interface HowItWorksProps {
  isActive: boolean
  onLaunch: () => void
}

export function HowItWorks({ isActive, onLaunch }: HowItWorksProps): ReactElement {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">How Rerit Works</h2>
        <p className="text-muted-foreground">
          {isActive
            ? 'Rerit is now running in the background'
            : 'Follow these simple steps to start using Rerit'}
        </p>
      </div>

      {isActive ? (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-green-500/30 bg-green-500/10 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
            <Zap className="h-6 w-6 text-green-500" />
          </div>
          <h3 className="text-xl font-medium text-green-500">Rerit is Active</h3>
          <p className="text-center text-muted-foreground">
            Rerit is now running in the background. Use the global shortcut to rephrase text
            anywhere.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-3 rounded-lg border border-white/10 p-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <MousePointer className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium">1. Select Text</h3>
              <p className="text-sm text-muted-foreground">
                Highlight any text in any application on your computer
              </p>
            </div>

            <div className="flex flex-col items-center space-y-3 rounded-lg border border-white/10 p-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <Keyboard className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium">2. Use Shortcut</h3>
              <p className="text-sm text-muted-foreground">
                Press <kbd className="rounded bg-muted px-1.5 py-0.5">Cmd+Shift+E</kbd> to activate
                Rerit
              </p>
            </div>

            <div className="flex flex-col items-center space-y-3 rounded-lg border border-white/10 p-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <ClipboardCheck className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium">3. Get Results</h3>
              <p className="text-sm text-muted-foreground">
                The rephrased text is automatically pasted back
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-muted/30 p-4 text-sm">
            <p className="text-muted-foreground">
              <strong>Tip:</strong> Rerit will run in the background. You can access settings and
              toggle it on/off from the menu bar icon.
            </p>
          </div>
        </div>
      )}

      {!isActive && (
        <div className="flex justify-center">
          <Button
            onClick={onLaunch}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Zap className="mr-2 h-4 w-4" />
            Launch Rerit
          </Button>
        </div>
      )}
    </div>
  )
}
