import { ReactElement, useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { ArrowRight } from 'lucide-react'

interface TextPreviewProps {
  selectedMood: string
}

// Sample text examples for different tones
const toneExamples: Record<string, { original: string; rephrased: string }> = {
  // Professional tones
  professional: {
    original: 'I think this idea could work well if we try it out soon.',
    rephrased: 'I believe this proposal merits implementation in the near future.'
  },
  formal: {
    original: 'Hey, can you send me that report when you get a chance?',
    rephrased: 'Could you please provide the requested report at your earliest convenience?'
  },
  business: {
    original: 'We need to talk about the budget issues.',
    rephrased:
      'We should schedule a discussion regarding the budgetary considerations and their implications for our quarterly objectives.'
  },
  executive: {
    original: 'This project is taking too long and costing too much.',
    rephrased:
      'Our current project timeline and resource allocation require strategic realignment to ensure optimal ROI and stakeholder satisfaction.'
  },

  // Casual tones
  casual: {
    original:
      'The implementation of this strategic initiative necessitates cross-functional collaboration.',
    rephrased: 'We need teams to work together to get this new plan started.'
  },
  friendly: {
    original: 'Please submit your documents by the deadline.',
    rephrased:
      'Hey! Just a friendly reminder to get your documents in by the deadline. Thanks so much!'
  },
  conversational: {
    original: 'The meeting has been rescheduled to next Tuesday.',
    rephrased:
      'So, we had to move the meeting to next Tuesday instead. Hope that works for everyone!'
  },
  informal: {
    original: 'Please be advised that the office will be closed tomorrow.',
    rephrased: 'Just so you know, the office is closed tomorrow.'
  },

  // Creative tones
  creative: {
    original: 'The sunset was very pretty and the sky turned different colors.',
    rephrased:
      'The sunset painted the canvas of the sky with a masterpiece of fiery hues, transforming the heavens into a kaleidoscope of twilight magic.'
  },
  witty: {
    original: 'The meeting was long and boring.',
    rephrased: 'The meeting was so long, I started aging in dog years. Even my coffee fell asleep.'
  },
  playful: {
    original: 'We launched our new product today.',
    rephrased: 'Ta-da! 🎉 Our shiny new product just made its grand debut into the world!'
  },
  dramatic: {
    original: 'Sales increased by 10% this quarter.',
    rephrased:
      'Against all odds, through sheer determination and unwavering commitment, we achieved a triumphant 10% surge in sales this quarter!'
  },

  // Persuasive tones
  persuasive: {
    original: 'Our new product has several features that might interest customers.',
    rephrased:
      'Our revolutionary product delivers game-changing features that will transform your experience and exceed your expectations.'
  },
  confident: {
    original: 'I think this approach might work.',
    rephrased:
      'This approach will deliver the results we need. I have complete confidence in its success.'
  },
  authoritative: {
    original: 'You should probably consider this option.',
    rephrased:
      'Based on extensive analysis and proven methodologies, this option represents the optimal path forward.'
  },
  sales: {
    original: 'Our product is good.',
    rephrased:
      'Our product delivers exceptional value, transforming challenges into opportunities and driving unprecedented success for our customers.'
  },

  // Emotional tones
  empathetic: {
    original: 'We understand this change may be difficult.',
    rephrased:
      'We deeply understand that this change brings uncertainty and challenges. Your feelings are completely valid, and we are here to support you through this transition.'
  },
  optimistic: {
    original: 'The project faced some setbacks.',
    rephrased:
      'While the project encountered some challenges, these valuable learning opportunities have positioned us for even greater success ahead!'
  },
  enthusiastic: {
    original: 'We are pleased to announce our new initiative.',
    rephrased:
      'We are absolutely thrilled and excited to unveil our groundbreaking new initiative that will revolutionize everything!'
  },
  calm: {
    original: 'There seems to be an urgent issue that needs attention.',
    rephrased:
      'There appears to be a situation that would benefit from our thoughtful attention and measured response.'
  },

  // Technical tones
  technical: {
    original: 'The system is not working properly.',
    rephrased:
      'The system is experiencing operational anomalies that require diagnostic analysis to identify root cause parameters and implement corrective protocols.'
  },
  academic: {
    original: 'Social media affects how people communicate.',
    rephrased:
      'Contemporary social media platforms have fundamentally altered interpersonal communication paradigms, as evidenced by empirical research in digital sociology.'
  },
  scientific: {
    original: 'The experiment showed interesting results.',
    rephrased:
      'The experimental data yielded statistically significant findings (p < 0.05) that warrant further investigation and peer review validation.'
  },
  educational: {
    original: 'This is how the process works.',
    rephrased:
      'Let me walk you through this step-by-step process, explaining each component so you can understand the underlying principles and apply them effectively.'
  },

  // Legacy compatibility
  simple: {
    original:
      'The implementation of the strategic initiative necessitates cross-functional collaboration.',
    rephrased: 'We need teams to work together to start this new plan.'
  },
  punchy: {
    original:
      'Our new product has several features that might interest customers who are looking for solutions.',
    rephrased:
      'Our new product? Game-changing features. Perfect for customers seeking real solutions. Now.'
  },
  grammar: {
    original: 'Me and the team was thinking about how we could of improved the process.',
    rephrased: 'The team and I were thinking about how we could have improved the process.'
  },
  summarize: {
    original:
      "The quarterly financial report indicates that we've seen a 12% increase in revenue compared to last quarter, with particularly strong performance in our North American market where sales grew by 18%. However, expenses have also risen by 7%, primarily due to the expansion of our marketing department and the launch of two new product lines. Our European division experienced a slight decline of 3%, which we attribute to increased competition and unfavorable exchange rates. Overall, the company's net profit margin has improved from 15% to 17%.",
    rephrased:
      'Q1 financials: Revenue up 12% (North America +18%), expenses increased 7% due to marketing expansion and new products. Europe down 3%. Net profit margin improved from 15% to 17%.'
  }
}

export function TextPreview({ selectedMood }: TextPreviewProps): ReactElement {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Reset when tone changes
  useEffect(() => {
    const example = toneExamples[selectedMood] || toneExamples.professional
    setInputText(example.original)
    setOutputText('')
  }, [selectedMood])

  const handlePreview = (): void => {
    setIsProcessing(true)

    // Simulate API call delay
    setTimeout(() => {
      // In a real app, this would be an API call to OpenAI or similar
      const example = toneExamples[selectedMood] || toneExamples.professional
      setOutputText(example.rephrased)
      setIsProcessing(false)
    }, 1000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setInputText(e.target.value)
    setOutputText('')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Preview Your Rephrasing Style</h2>
        <p className="text-muted-foreground">
          See how your text will be transformed with the &quot;{selectedMood}&quot; tone
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Original Text</label>
          <Textarea
            value={inputText}
            onChange={handleInputChange}
            placeholder="Enter text to rephrase..."
            className="h-40 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Rephrased Text</label>
          <Textarea
            value={outputText}
            readOnly
            placeholder="Rephrased text will appear here..."
            className="h-40 resize-none bg-muted/50"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handlePreview}
          disabled={isProcessing || !inputText.trim()}
          className="min-w-32"
        >
          {isProcessing ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Processing...
            </>
          ) : (
            <>
              Preview
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      <div className="rounded-lg bg-muted/30 p-4 text-sm">
        <p className="text-muted-foreground">
          <strong>Note:</strong> This is a preview of how Rerit will rephrase your text. When using
          the app, simply select text anywhere on your computer, press{' '}
          <kbd className="rounded bg-muted px-1.5 py-0.5">Cmd+Shift+R</kbd>, and the rephrased text
          will be pasted automatically.
        </p>
      </div>
    </div>
  )
}
