import { ReactElement, useState, useEffect } from 'react'
import { useUser } from '@renderer/hooks/useUser'
import { Button } from '@renderer/components/ui/button'
import { TonePicker } from '@renderer/components/TonePicker'
import { TextPreview } from '@renderer/components/TextPreview'
import { HowItWorks } from '@renderer/components/HowItWorks'
import { usageTracker } from '@renderer/services/api'
import { Settings, Zap, ArrowRight, LogOut } from 'lucide-react'

type ConfigStep = 'tone' | 'preview' | 'howItWorks'

export default function Dashboard(): ReactElement {
  const { user, logout } = useUser()
  const [currentStep, setCurrentStep] = useState<ConfigStep>('tone')
  const [selectedTone, setSelectedTone] = useState<string>('professional')
  const [isReritActive, setIsReritActive] = useState<boolean>(false)

  // Load saved preferences from localStorage on component mount
  useEffect(() => {
    // Load usage data from storage
    usageTracker.loadFromStorage()

    const savedTone = localStorage.getItem('rerit-tone')
    if (savedTone) {
      setSelectedTone(savedTone)
    }

    const hasCompletedSetup = localStorage.getItem('rerit-setup-completed') === 'true'
    if (hasCompletedSetup) {
      // Skip to how it works if setup was previously completed
      setCurrentStep('howItWorks')
    }
  }, [])

  // Save tone preference when it changes
  useEffect(() => {
    localStorage.setItem('rerit-tone', selectedTone)

    // Also save to electron store for use in the main process
    if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.send('set-tone', selectedTone)
    }
  }, [selectedTone])

  const handleNextStep = (): void => {
    if (currentStep === 'tone') {
      setCurrentStep('preview')
    } else if (currentStep === 'preview') {
      setCurrentStep('howItWorks')
      localStorage.setItem('rerit-setup-completed', 'true')
    }
  }

  const handlePrevStep = (): void => {
    if (currentStep === 'preview') {
      setCurrentStep('tone')
    } else if (currentStep === 'howItWorks') {
      setCurrentStep('preview')
    }
  }

  const launchRerit = (): void => {
    setIsReritActive(true)
    // Here you would:
    // 1. Minimize the window
    // 2. Enable the shortcut
    // 3. Show the tray icon
    // 4. Start the background flow
    if (window.electron) {
      window.electron.ipcRenderer.send('minimize-to-tray')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/70 via-white to-purple-50/70 flex flex-col">
      {/* Header */}
      <header className="z-10 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-text-primary">Rerit</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-secondary">{user?.name}</span>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="z-10 flex flex-1 flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl card">
          {/* Steps indicator */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep === 'tone' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              >
                1
              </div>
              <span
                className={
                  currentStep === 'tone' ? 'font-medium text-text-primary' : 'text-text-secondary'
                }
              >
                Choose Tone
              </span>
            </div>
            <div className="h-px flex-1 bg-border mx-4"></div>
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep === 'preview' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              >
                2
              </div>
              <span
                className={
                  currentStep === 'preview'
                    ? 'font-medium text-text-primary'
                    : 'text-text-secondary'
                }
              >
                Preview
              </span>
            </div>
            <div className="h-px flex-1 bg-border mx-4"></div>
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep === 'howItWorks' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              >
                3
              </div>
              <span
                className={
                  currentStep === 'howItWorks'
                    ? 'font-medium text-text-primary'
                    : 'text-text-secondary'
                }
              >
                Launch
              </span>
            </div>
          </div>

          {/* Accent bar */}
          <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6"></div>

          {/* Step content */}
          <div className="min-h-[400px] overflow-hidden">
            {currentStep === 'tone' && (
              <TonePicker
                selectedTone={selectedTone}
                onSelectTone={(tone) => {
                  setSelectedTone(tone)
                  // Directly save to electron store when tone is changed
                  if (window.electron?.ipcRenderer) {
                    window.electron.ipcRenderer.send('set-tone', tone)
                  }
                }}
              />
            )}

            {currentStep === 'preview' && <TextPreview selectedMood={selectedTone} />}

            {currentStep === 'howItWorks' && (
              <HowItWorks isActive={isReritActive} onLaunch={launchRerit} />
            )}
          </div>

          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            <div className="w-20">
              {currentStep !== 'tone' && (
                <Button variant="ghost" onClick={handlePrevStep}>
                  Back
                </Button>
              )}
            </div>

            {currentStep !== 'howItWorks' ? (
              <Button onClick={handleNextStep}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : !isReritActive ? (
              <Button onClick={launchRerit} className="bg-primary hover:bg-primary/80">
                <Zap className="mr-2 h-4 w-4" />
                Launch Rerit
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setIsReritActive(false)}>
                <Settings className="mr-2 h-4 w-4" />
                Configure
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="z-10 border-t border-border bg-background/80 backdrop-blur-sm p-4 text-center text-sm text-text-secondary">
        Rerit — Rephrase text instantly across your desktop
      </footer>
    </div>
  )
}
