interface JourneyStep {
  id: string;
  text: string;
  level: number;
  parent?: string;
  timestamp: number;
}

interface AICredentials {
  openai?: string;
  anthropic?: string;
  provider: 'openai' | 'anthropic';
}

interface AIGeneratedSuggestion {
  id: number;
  text: string;
  reasoning?: string;
  confidence?: number;
}

class AIService {
  private credentials: AICredentials | null = null;
  private corsWarningShown: boolean = false;
  private baseUrl = 'http://localhost:3001/api';

  constructor() {
    this.loadCredentials();
  }

  private loadCredentials() {
    const stored = localStorage.getItem('ai_credentials');
    if (stored) {
      try {
        this.credentials = JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse stored credentials');
        localStorage.removeItem('ai_credentials');
      }
    }
  }

  setCredentials(credentials: AICredentials) {
    this.credentials = credentials;
    localStorage.setItem('ai_credentials', JSON.stringify(credentials));
    // Reset CORS warning when new credentials are set
    this.corsWarningShown = false;
  }

  getCredentials(): AICredentials | null {
    return this.credentials;
  }

  clearCredentials() {
    this.credentials = null;
    localStorage.removeItem('ai_credentials');
    this.corsWarningShown = false;
  }

  hasValidCredentials(): boolean {
    return !!(this.credentials?.openai || this.credentials?.anthropic);
  }

  private showCorsWarning() {
    if (!this.corsWarningShown) {
      console.warn(`
🚨 AI API CORS Limitation Notice:

Direct API calls to OpenAI/Anthropic from browsers are blocked by CORS policies for security reasons.

To use AI features, you would need:
1. A backend server to proxy API calls, OR
2. A browser extension to disable CORS, OR  
3. Deploy to a platform with server-side API handling

For now, falling back to enhanced rule-based suggestions.
      `);
      this.corsWarningShown = true;
    }
  }

  private buildPrompt(context: string, journeySteps: any[]): string {
    const systemPrompt = `You are an AI assistant tasked with helping users map out the user journey for an application or experience through an interactive, stepwise process. Your goal is to provide intelligent, concise suggestions at each step, allowing the user to build and refine the journey iteratively.

Instructions:
- Generate 1 to 5 suggestions for starting points or next steps in the user journey
- Each suggestion should be LIMITED TO 6 WORDS MAXIMUM
- Be numbered from 1 to 5
- Capture key actions, decisions, or transitions in the user journey
- Be highly relevant and insightful, considering the logical flow and potential pain points
- Think critically about the user journey, aiming for suggestions that are concise yet informative
- Focus on the essence of each step

Context: ${context}

Current Journey Steps:
${journeySteps.map((step, idx) => `${idx + 1}. ${step.text}`).join('\n')}

Generate 1-5 numbered suggestions (6 words max each) for the next logical steps in this user journey:`;

    return systemPrompt;
  }

  async generateSuggestions(context: string, journeySteps: any[]): Promise<AIGeneratedSuggestion[]> {
    if (!this.hasValidCredentials()) {
      throw new Error('No AI credentials configured');
    }

    // Check if this is a completion prompt (starts with "Based on the current user journey")
    const isCompletionPrompt = context.startsWith('Based on the current user journey');
    
    const prompt = isCompletionPrompt 
      ? context  // Use the completion prompt directly
      : this.buildPrompt(context, journeySteps);  // Build normal suggestions prompt
    
    try {
      if (this.credentials?.provider === 'openai' && this.credentials.openai) {
        return await this.callOpenAI(prompt);
      } else if (this.credentials?.provider === 'anthropic' && this.credentials.anthropic) {
        return await this.callAnthropic(prompt);
      } else {
        throw new Error('Invalid provider configuration');
      }
    } catch (error) {
      console.error('AI API call failed:', error);
      throw error;
    }
  }

  private async callOpenAI(prompt: string): Promise<AIGeneratedSuggestion[]> {
    const response = await fetch(`${this.baseUrl}/openai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        apiKey: this.credentials?.openai
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'OpenAI API call failed');
    }

    const data = await response.json();
    return this.parseAIResponse(data.choices[0].message.content);
  }

  private async callAnthropic(prompt: string): Promise<AIGeneratedSuggestion[]> {
    const response = await fetch(`${this.baseUrl}/anthropic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        apiKey: this.credentials?.anthropic
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Anthropic API call failed');
    }

    const data = await response.json();
    return this.parseAIResponse(data.content[0].text);
  }

  private parseAIResponse(response: string): AIGeneratedSuggestion[] {
    const suggestions: AIGeneratedSuggestion[] = [];
    const lines = response.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const match = line.match(/^(\d+)\.?\s*(.+)$/);
      if (match) {
        const [, number, text] = match;
        const suggestion = {
          id: parseInt(number),
          text: text.trim(),
          confidence: 0.85 + Math.random() * 0.1 // Random confidence between 0.85-0.95
        };
        
        // Enforce 6 word limit
        const words = suggestion.text.split(' ');
        if (words.length > 6) {
          suggestion.text = words.slice(0, 6).join(' ');
        }
        
        suggestions.push(suggestion);
      }
    }
    
    // If no structured response, try to extract any numbered items
    if (suggestions.length === 0) {
      const numberedItems = response.match(/\d+[.)]\s*[^.\n]+/g);
      if (numberedItems) {
        numberedItems.slice(0, 5).forEach((item, index) => {
          const text = item.replace(/^\d+[.)]\s*/, '').trim();
          const words = text.split(' ');
          const limitedText = words.length > 6 ? words.slice(0, 6).join(' ') : text;
          
          suggestions.push({
            id: index + 1,
            text: limitedText,
            confidence: 0.8
          });
        });
      }
    }

    return suggestions.slice(0, 5); // Max 5 suggestions
  }

  // Mock method to simulate having AI credentials (for UI state)
  hasActiveMockAI(): boolean {
    return this.hasValidCredentials();
  }
}

const aiService = new AIService();

export { aiService, type AICredentials, type AIGeneratedSuggestion }; 