// Rerit API Service
// Handles authentication, rewrite requests, usage tracking, and error handling

export interface RewriteRequest {
  text: string
  tone: string
}

export interface RewriteResponse {
  text: string
  metadata: {
    processingTimeMs: number
    timestamp: string
    requestId: string
    usage: {
      remainingToday: number
      dailyLimit: number
      percentUsed: number
    }
    plan: {
      name: string
      features: string[]
    }
  }
}

export interface APIError {
  error: string
  code: string
  timestamp: string
  requestId: string
  details?: {
    reason?: string
    authType?: string
    usage?: {
      dailyUsage: number
      dailyLimit: number
      remainingToday: number
    }
    currentPlan?: string
    upgradeUrl?: string
    suggestedPlan?: string
    retryAfter?: number
    resetTime?: string
    validationErrors?: Array<{
      field: string
      message: string
    }>
  }
}

export interface ApiResult<T> {
  success: boolean
  data?: T
  error?: string
  errorCode?: string
  message?: string
  upgradeUrl?: string
  retryAfter?: number
}

export interface UsageStatus {
  used: number
  limit: number
  remaining: number
  percentUsed: number
  plan: string
}

export interface SubscriptionInfo {
  plan: string
  dailyLimit: number
  features: string[]
  upgradeUrl?: string
}

class ReritAPI {
  private baseUrl: string
  private appVersion = '1.0.0'
  private platform: string

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    this.platform = navigator.platform || 'unknown'
  }

  private getHeaders(userId: string, token: string): Record<string, string> {
    return {
      Authorization: `Electron ${userId}:${token}`,
      'Content-Type': 'application/json',
      'User-Agent': `ReritApp/${this.appVersion} (${this.platform})`
    }
  }

  async rewriteText(
    text: string,
    tone: string,
    userId: string,
    token: string
  ): Promise<ApiResult<RewriteResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/rewrite`, {
        method: 'POST',
        headers: this.getHeaders(userId, token),
        body: JSON.stringify({ text, tone })
      })

      if (!response.ok) {
        const errorData: APIError = await response.json()
        return this.handleAPIError(errorData)
      }

      const result: RewriteResponse = await response.json()
      return { success: true, data: result }
    } catch (error) {
      console.error('Rewrite request failed:', error)
      return {
        success: false,
        error: 'network_error',
        message: 'Failed to connect to Rerit servers. Please check your internet connection.'
      }
    }
  }

  async checkSubscription(userId: string, token: string): Promise<ApiResult<SubscriptionInfo>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/user/subscription`, {
        method: 'GET',
        headers: this.getHeaders(userId, token)
      })

      if (!response.ok) {
        const errorData: APIError = await response.json()
        return this.handleAPIError(errorData)
      }

      const result = await response.json()
      return { success: true, data: result.subscription }
    } catch (error) {
      console.error('Subscription check failed:', error)
      return {
        success: false,
        error: 'network_error',
        message: 'Failed to check subscription status'
      }
    }
  }

  private handleAPIError(errorData: APIError): ApiResult<never> {
    switch (errorData.code) {
      case 'ELECTRON_AUTH_INVALID':
        return {
          success: false,
          error: 'auth_expired',
          errorCode: errorData.code,
          message: 'Please sign in again'
        }

      case 'USAGE_LIMIT_EXCEEDED':
        return {
          success: false,
          error: 'limit_exceeded',
          errorCode: errorData.code,
          message: `Daily limit reached. ${errorData.details?.suggestedPlan} plan offers more rewrites`,
          upgradeUrl: errorData.details?.upgradeUrl
        }

      case 'RATE_LIMIT_EXCEEDED':
        return {
          success: false,
          error: 'rate_limited',
          errorCode: errorData.code,
          message: `Too many requests. Try again in ${errorData.details?.retryAfter} seconds`,
          retryAfter: errorData.details?.retryAfter
        }

      case 'VALIDATION_ERROR':
        const validationMessage =
          errorData.details?.validationErrors?.[0]?.message || 'Invalid input'
        return {
          success: false,
          error: 'validation_error',
          errorCode: errorData.code,
          message: validationMessage
        }

      default:
        return {
          success: false,
          error: 'unknown',
          errorCode: errorData.code,
          message: errorData.error || 'An error occurred'
        }
    }
  }
}

// Usage tracking class
export class UsageTracker {
  private dailyUsage = 0
  private dailyLimit = 5
  private currentPlan = 'Free'
  private lastUsageCheck: Date | null = null

  updateFromResponse(response: RewriteResponse): void {
    if (response.metadata?.usage) {
      this.dailyUsage = response.metadata.usage.dailyLimit - response.metadata.usage.remainingToday
      this.dailyLimit = response.metadata.usage.dailyLimit
      this.currentPlan = response.metadata.plan.name
      this.lastUsageCheck = new Date()

      // Store in localStorage for persistence
      localStorage.setItem(
        'rerit-usage',
        JSON.stringify({
          dailyUsage: this.dailyUsage,
          dailyLimit: this.dailyLimit,
          currentPlan: this.currentPlan,
          lastCheck: this.lastUsageCheck.toISOString()
        })
      )
    }
  }

  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('rerit-usage')
      if (stored) {
        const data = JSON.parse(stored)
        const lastCheck = new Date(data.lastCheck)
        const today = new Date()

        // Reset if it's a new day
        if (lastCheck.toDateString() !== today.toDateString()) {
          this.resetDaily()
        } else {
          this.dailyUsage = data.dailyUsage || 0
          this.dailyLimit = data.dailyLimit || 5
          this.currentPlan = data.currentPlan || 'Free'
          this.lastUsageCheck = lastCheck
        }
      }
    } catch (error) {
      console.error('Failed to load usage from storage:', error)
    }
  }

  resetDaily(): void {
    this.dailyUsage = 0
    this.lastUsageCheck = new Date()
    localStorage.removeItem('rerit-usage')
  }

  canMakeRequest(): boolean {
    return this.dailyUsage < this.dailyLimit
  }

  getUsageStatus(): UsageStatus {
    return {
      used: this.dailyUsage,
      limit: this.dailyLimit,
      remaining: Math.max(0, this.dailyLimit - this.dailyUsage),
      percentUsed: Math.round((this.dailyUsage / this.dailyLimit) * 100),
      plan: this.currentPlan
    }
  }

  getUsageMessage(): string {
    const status = this.getUsageStatus()

    if (status.remaining === 0) {
      return `Daily limit reached (${status.used}/${status.limit}). Upgrade for more rewrites.`
    } else if (status.remaining <= 2) {
      return `${status.remaining} rewrites remaining today. Consider upgrading to Pro.`
    } else {
      return `${status.remaining}/${status.limit} rewrites remaining today.`
    }
  }
}

// Tone categories and suggestions
export const toneCategories = {
  'Work & Business': ['professional', 'formal', 'business', 'executive'],
  'Social & Personal': ['casual', 'friendly', 'conversational', 'informal'],
  'Creative Writing': ['creative', 'witty', 'playful', 'dramatic'],
  'Marketing & Sales': ['persuasive', 'confident', 'authoritative', 'sales'],
  'Support & Care': ['empathetic', 'optimistic', 'enthusiastic', 'calm'],
  'Technical & Academic': ['technical', 'academic', 'scientific', 'educational']
}

export const popularTones = ['professional', 'casual', 'creative', 'persuasive']

export function suggestTone(context?: string): string[] {
  const suggestions = {
    email: ['professional', 'formal', 'business'],
    social_media: ['casual', 'friendly', 'creative'],
    marketing: ['persuasive', 'sales', 'enthusiastic'],
    technical_doc: ['technical', 'academic', 'educational'],
    customer_support: ['empathetic', 'professional', 'calm']
  }

  return suggestions[context as keyof typeof suggestions] || popularTones
}

export function getToneDescription(tone: string): string {
  const descriptions: Record<string, string> = {
    professional: 'Formal, business-appropriate language',
    formal: 'Very formal, academic or legal style',
    business: 'Corporate communication style',
    executive: 'C-level executive communication style',
    casual: 'Relaxed, conversational tone',
    friendly: 'Warm and approachable',
    conversational: 'Natural dialogue style',
    informal: 'Relaxed, everyday language',
    creative: 'Imaginative and original expression',
    witty: 'Clever and humorous',
    playful: 'Fun and lighthearted',
    dramatic: 'Emphatic and expressive',
    persuasive: 'Convincing and compelling',
    confident: 'Assertive and sure',
    authoritative: 'Expert and commanding',
    sales: 'Marketing and sales-focused',
    empathetic: 'Understanding and caring',
    optimistic: 'Positive and hopeful',
    enthusiastic: 'Energetic and excited',
    calm: 'Peaceful and soothing',
    technical: 'Precise and detailed',
    academic: 'Scholarly and research-focused',
    scientific: 'Evidence-based and analytical',
    educational: 'Teaching and explanatory'
  }

  return descriptions[tone] || 'Custom tone style'
}

// Singleton API instance
export const reritAPI = new ReritAPI()

// Singleton usage tracker
export const usageTracker = new UsageTracker()
