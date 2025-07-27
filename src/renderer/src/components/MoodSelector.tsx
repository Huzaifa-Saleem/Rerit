import { ReactElement, JSX } from 'react'
import { BookOpen, Briefcase, Zap, Check, Sparkles, Scissors } from 'lucide-react'

interface MoodOption {
  id: string
  name: string
  description: string
  icon: JSX.Element
}

const moodOptions: MoodOption[] = [
  {
    id: 'formal',
    name: 'Make it Formal',
    description: 'Professional language suitable for business and academic contexts',
    icon: <Briefcase className="h-5 w-5" />
  },
  {
    id: 'simple',
    name: 'Simplify',
    description: 'Clear, straightforward language that anyone can understand',
    icon: <BookOpen className="h-5 w-5" />
  },
  {
    id: 'punchy',
    name: 'Make it Punchy',
    description: 'Short, impactful sentences with powerful language',
    icon: <Zap className="h-5 w-5" />
  },
  {
    id: 'grammar',
    name: 'Fix Grammar Only',
    description: 'Correct grammar and spelling without changing the style',
    icon: <Check className="h-5 w-5" />
  },
  {
    id: 'creative',
    name: 'Make it Creative',
    description: 'Add flair and originality to the text',
    icon: <Sparkles className="h-5 w-5" />
  },
  {
    id: 'summarize',
    name: 'Summarize',
    description: 'Condense the text while preserving key points',
    icon: <Scissors className="h-5 w-5" />
  }
]

interface MoodSelectorProps {
  selectedMood: string
  onSelectMood: (mood: string) => void
}

export function MoodSelector({ selectedMood, onSelectMood }: MoodSelectorProps): ReactElement {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Choose Your Rephrasing Style</h2>
        <p className="text-muted-foreground">Select how you want Rerit to transform your text</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {moodOptions.map((option) => (
          <div
            key={option.id}
            className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-all hover:bg-white/5 ${
              selectedMood === option.id ? 'border-primary bg-primary/5' : 'border-white/10'
            }`}
            onClick={() => onSelectMood(option.id)}
          >
            <div
              className={`rounded-full p-2 ${
                selectedMood === option.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {option.icon}
            </div>
            <div>
              <h3 className="font-medium">{option.name}</h3>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
