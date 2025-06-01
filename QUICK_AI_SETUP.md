# ⚡ Quick AI Setup Guide

Use these templates for instant AI integration in any project.

## 🚀 **1-Minute AI Setup Prompt**

```
Create a complete AI integration system for my React TypeScript app with:

1. **AIService class** supporting OpenAI & Anthropic APIs
2. **CORS proxy server** (Express.js on port 3001) 
3. **Credentials modal** with provider selection
4. **Error handling** and loading states
5. **TypeScript interfaces** for all AI types

Requirements:
- Secure localStorage for API keys
- User-friendly error notifications  
- Production-ready with proper validation
- Easy integration with existing components

File structure:
- src/services/aiService.ts
- src/components/AICredentialsModal.tsx  
- server.cjs (Express proxy)

Usage pattern:
```typescript
const { callAI, loading, error } = useAI();
const response = await callAI({ prompt: "Hello AI!" });
```

Make it copy-paste ready with setup instructions.
```

## 📋 **Essential Code Snippets**

### **Basic AI Hook Usage:**
```typescript
import { useAI } from './hooks/useAI';

function MyComponent() {
  const { callAI, loading, error } = useAI();
  
  const handleAICall = async () => {
    const response = await callAI({
      prompt: "Generate a creative title",
      maxTokens: 50
    });
    console.log(response);
  };
  
  return (
    <button onClick={handleAICall} disabled={loading}>
      {loading ? 'Generating...' : 'Generate with AI'}
    </button>
  );
}
```

### **AI Service Integration:**
```typescript
import { aiService } from './services/aiService';

// Check if AI is configured
if (aiService.hasValidCredentials()) {
  const suggestions = await aiService.generateSuggestions(context, history);
}

// Setup AI credentials
aiService.setCredentials({
  provider: 'openai',
  openai: 'your-api-key'
});
```

### **Express Proxy Server (server.cjs):**
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/openai', async (req, res) => {
  // OpenAI API call logic
});

app.post('/api/anthropic', async (req, res) => {
  // Anthropic API call logic  
});

app.listen(3001, () => {
  console.log('🚀 AI Proxy Server running on http://localhost:3001');
});
```

## 🎯 **Specialized AI Prompts**

### **For Chat Applications:**
```
Add conversational AI to my React app with:
- Message history and threading
- Typing indicators and streaming responses
- Context-aware conversations
- Export/import chat functionality
- Custom system prompts per conversation
```

### **For Content Creation:**
```
Build an AI content generator with:
- Multiple content types (blog, email, social)
- Template system with variables
- Tone and style controls
- SEO optimization features
- Real-time word count and readability
```

### **For Code Generation:**
```
Create an AI code assistant with:
- Multi-language code generation
- Syntax highlighting and formatting
- Code explanation and documentation
- Error analysis and debugging help
- Copy-to-clipboard functionality
```

## 🔧 **Framework-Specific Prompts**

### **Vue.js:**
```
Implement AI integration for Vue 3 with:
- Composables instead of React hooks
- Pinia store for AI state management
- Vue components with proper reactivity
- TypeScript support throughout
```

### **Next.js:**
```
Add AI functionality to Next.js app with:
- API routes for AI endpoints (no Express needed)
- Server-side AI calls when appropriate
- Edge runtime compatibility
- Proper TypeScript integration
```

### **Svelte:**
```
Create AI integration for SvelteKit with:
- Svelte stores for state management
- Server actions for AI API calls
- Reactive UI components
- TypeScript definitions
```

## 🚀 **Production Deployment Prompts**

### **Vercel Deployment:**
```
Prepare my AI app for Vercel deployment with:
- Environment variables for API keys
- Serverless functions for AI endpoints
- Edge runtime optimization
- Proper build configuration
```

### **Railway/Heroku:**
```
Setup AI app for Railway deployment with:
- Express server configuration
- Environment variable management
- Health check endpoints
- Proper PORT handling
```

## 📦 **Package.json Templates**

### **Basic AI Dependencies:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "scripts": {
    "ai:server": "node server.cjs",
    "dev:full": "concurrently \"npm run ai:server\" \"npm run dev\""
  }
}
```

### **Advanced AI Features:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "rate-limiter-flexible": "^3.0.0"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

## 🎯 **Quick Problem Solvers**

### **CORS Issues:**
```
Fix CORS issues in my AI integration by:
- Creating Express proxy server on port 3001
- Proper CORS headers configuration
- Request forwarding to AI APIs
- Error handling for network issues
```

### **API Key Security:**
```
Secure AI API keys with:
- localStorage for client-side storage
- No keys in environment files
- Validation before API calls
- Clear error messages for invalid keys
```

### **Rate Limiting:**
```
Add rate limiting to AI calls with:
- Request throttling per user
- Usage analytics and tracking
- Graceful degradation when limits hit
- User feedback for rate limits
```

---

## 🎉 **Copy-Paste Workflow**

1. **Copy main prompt** from section 1
2. **Customize** for your specific needs
3. **Paste into Claude/ChatGPT**
4. **Follow setup instructions** in the response
5. **Test AI integration** with provided examples

**Result: Production-ready AI functionality in under 10 minutes!** 