import { ReactElement, useState } from 'react'
import { Button } from './ui/button'
import { toneCategories, popularTones, getToneDescription } from '@renderer/services/api'
import { ChevronDown, ChevronUp, Zap, Star, Settings } from 'lucide-react'
import { isMac } from '@renderer/lib/utils'

interface TonePickerProps {
  selectedTone: string
  onSelectTone: (tone: string) => void
  className?: string
}

export function TonePicker({
  selectedTone,
  onSelectTone,
  className
}: TonePickerProps): ReactElement {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Work & Business')
  const [showAllCategories, setShowAllCategories] = useState(false)

  const handleToneSelect = (tone: string): void => {
    onSelectTone(tone)
    // Store as recent tone
    const recentTones = JSON.parse(localStorage.getItem('rerit-recent-tones') || '[]')
    const updated = [tone, ...recentTones.filter((t: string) => t !== tone)].slice(0, 6)
    localStorage.setItem('rerit-recent-tones', JSON.stringify(updated))
  }

  const handleCreateCustomTone = (): void => {
    const titleInput = document.getElementById('custom-tone-title') as HTMLInputElement
    const descriptionInput = document.getElementById(
      'custom-tone-description'
    ) as HTMLTextAreaElement

    const title = titleInput?.value.trim()
    const description = descriptionInput?.value.trim()

    if (!title) {
      // Focus the title input if empty
      titleInput?.focus()
      return
    }

    if (!description) {
      // Focus the description input if empty
      descriptionInput?.focus()
      return
    }

    // Create the custom tone string with both title and description
    const customTone = `${title}: ${description}`

    // Store custom tone in localStorage for future reference
    const customTones = JSON.parse(localStorage.getItem('rerit-custom-tones') || '[]')
    const toneEntry = {
      title,
      description,
      fullTone: customTone,
      createdAt: new Date().toISOString()
    }
    const updated = [
      toneEntry,
      ...customTones.filter((t: { title: string }) => t.title !== title)
    ].slice(0, 10)
    localStorage.setItem('rerit-custom-tones', JSON.stringify(updated))

    // Select the custom tone
    handleToneSelect(customTone)

    // Clear the inputs
    if (titleInput) titleInput.value = ''
    if (descriptionInput) descriptionInput.value = ''
  }

  const getCustomTones = (): Array<{
    title: string
    description: string
    fullTone: string
    createdAt: string
  }> => {
    try {
      return JSON.parse(localStorage.getItem('rerit-custom-tones') || '[]')
    } catch {
      return []
    }
  }

  const customTones = getCustomTones()

  const getRecentTones = (): string[] => {
    try {
      return JSON.parse(localStorage.getItem('rerit-recent-tones') || '[]')
    } catch {
      return []
    }
  }

  const recentTones = getRecentTones()

  const ToneButton = ({
    tone,
    isSelected = false,
    variant = 'default'
  }: {
    tone: string
    isSelected?: boolean
    variant?: 'default' | 'popular' | 'recent'
  }): ReactElement => (
    <Button
      key={tone}
      size="sm"
      variant={isSelected ? 'default' : 'outline'}
      className={`
        text-left justify-start h-auto p-3 transition-all
        ${isSelected ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-gray-50'}
        ${variant === 'popular' ? 'border-blue-200 hover:border-blue-300' : ''}
        ${variant === 'recent' ? 'border-green-200 hover:border-green-300' : ''}
      `}
      onClick={() => handleToneSelect(tone)}
    >
      <div className="flex flex-col items-start gap-1 w-full">
        <div className="flex items-center gap-2">
          {variant === 'popular' && <Star className="h-3 w-3 text-blue-500" />}
          {variant === 'recent' && <Zap className="h-3 w-3 text-green-500" />}
          <span className="font-medium capitalize">{tone}</span>
        </div>
        <span className="text-xs opacity-70 leading-tight">{getToneDescription(tone)}</span>
      </div>
    </Button>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Custom Tones */}
      {customTones.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Settings className="h-4 w-4 text-purple-500" />
            Your Custom Tones
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {customTones.slice(0, 3).map((customTone) => (
              <Button
                key={customTone.title}
                size="sm"
                variant={selectedTone === customTone.fullTone ? 'default' : 'outline'}
                className={`
                  text-left justify-start h-auto p-3 transition-all
                  ${selectedTone === customTone.fullTone ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-gray-50'}
                  border-purple-200 hover:border-purple-300
                `}
                onClick={() => handleToneSelect(customTone.fullTone)}
              >
                <div className="flex flex-col items-start gap-1 w-full">
                  <div className="flex items-center gap-2">
                    <Settings className="h-3 w-3 text-purple-500" />
                    <span className="font-medium">{customTone.title}</span>
                  </div>
                  <span className="text-xs opacity-70 leading-tight line-clamp-2">
                    {customTone.description}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Access */}
      {recentTones.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-green-500" />
            Recently Used
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {recentTones.slice(0, 4).map((tone) => (
              <ToneButton
                key={tone}
                tone={tone}
                isSelected={selectedTone === tone}
                variant="recent"
              />
            ))}
          </div>
        </div>
      )}

      {/* Popular Tones */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-blue-500" />
          Popular Tones
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {popularTones.map((tone) => (
            <ToneButton
              key={tone}
              tone={tone}
              isSelected={selectedTone === tone}
              variant="popular"
            />
          ))}
        </div>
      </div>

      {/* All Categories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">All Tones</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="text-xs"
          >
            {showAllCategories ? (
              <>
                Hide <ChevronUp className="ml-1 h-3 w-3" />
              </>
            ) : (
              <>
                Show All <ChevronDown className="ml-1 h-3 w-3" />
              </>
            )}
          </Button>
        </div>

        {showAllCategories && (
          <div className="space-y-4">
            {Object.entries(toneCategories).map(([category, tones]) => (
              <div key={category}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setExpandedCategory(expandedCategory === category ? null : category)
                  }
                  className="w-full justify-between p-2 h-auto mb-2 font-medium text-gray-700"
                >
                  {category}
                  {expandedCategory === category ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>

                {expandedCategory === category && (
                  <div className="grid grid-cols-1 gap-2 pl-4">
                    {tones.map((tone) => (
                      <ToneButton key={tone} tone={tone} isSelected={selectedTone === tone} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Tone Input */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Custom Tone</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tone Title</label>
            <input
              type="text"
              placeholder="e.g., Polite but Urgent"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              id="custom-tone-title"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tone Description</label>
            <textarea
              placeholder="e.g., Be polite and respectful but convey urgency. Keep sentences short and direct while maintaining professionalism."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              id="custom-tone-description"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleCreateCustomTone()
                }
              }}
            />
          </div>

          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Press {isMac() ? 'Cmd' : 'Ctrl'}+Enter or click Create to apply custom tone
            </p>
            <Button size="sm" variant="outline" onClick={handleCreateCustomTone}>
              Create Tone
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
