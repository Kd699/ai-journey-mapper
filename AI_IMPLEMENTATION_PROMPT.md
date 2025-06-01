# 🤖 AI Implementation Prompt Template

Use this prompt to quickly add AI functionality to any React/TypeScript application without the setup hassle.

## 📋 **Copy-Paste Prompt:**

```
I need to add AI functionality to my [React/Vue/Angular] application. Please implement a complete AI integration system with the following requirements:

### 🎯 **Core AI Features:**
- Support for both OpenAI (GPT-4/3.5) and Anthropic (Claude) APIs
- Secure credential management with local storage
- CORS-compliant proxy server for API requests
- Error handling with user-friendly notifications
- Loading states and rate limiting

### 🔧 **Technical Implementation:**
1. **AI Service Class** with:
   - Credential management (save/load/clear)
   - Provider switching (OpenAI/Anthropic)
   - Standardized API call methods
   - Error handling and fallback responses
   - Request/response parsing

2. **CORS Proxy Server** (Express.js):
   - Handle OpenAI and Anthropic API calls
   - Proper error handling and logging
   - CORS headers configured
   - Request validation

3. **React Components**:
   - AI Credentials Modal for API key setup
   - Provider selection (OpenAI/Anthropic)
   - Password visibility toggles
   - Validation and saving

4. **Integration Helpers**:
   - React hooks for AI calls
   - Loading states management
   - Error boundary components
   - Notification system

### 📁 **File Structure Needed:**
```
src/
├── services/
│   └── aiService.ts          # Main AI service class
├── components/
│   ├── AICredentialsModal.tsx # Setup modal
│   └── AILoadingSpinner.tsx   # Loading component
├── hooks/
│   ├── useAI.ts              # AI integration hook
│   └── useNotifications.ts   # Notification system
└── types/
    └── ai.ts                 # TypeScript definitions
server.cjs                    # Express proxy server
```

### 🚀 **Usage Pattern:**
```typescript
// Simple AI call example
const { callAI, loading, error } = useAI();

const handleAIRequest = async () => {
  const response = await callAI({
    prompt: "Your prompt here",
    maxTokens: 150,
    temperature: 0.7
  });
  console.log(response);
};
```

### ⚙️ **Configuration Requirements:**
- Environment variables for API endpoints
- Package.json scripts for running proxy server
- TypeScript types for all AI interfaces
- Error boundaries for AI failures
- Fallback responses when AI unavailable

### 🔒 **Security Features:**
- API keys stored securely in localStorage
- No API keys in code or environment files
- Request validation on proxy server
- Rate limiting to prevent abuse
- Proper error messages without exposing internals

### 🎨 **UI/UX Features:**
- Modern modal design with Tailwind CSS
- Provider selection with clear branding
- Password visibility toggles
- Validation feedback
- Loading states with spinners
- Success/error notifications

Please implement this complete system with:
1. All necessary TypeScript interfaces
2. Proper error handling throughout
3. Clean, reusable components
4. Clear documentation in code
5. Example usage patterns
6. Setup instructions

Make it production-ready and easy to integrate into existing applications.
```

## 🔄 **Customization Options:**

### **For Different Frameworks:**
Replace `[React/Vue/Angular]` with your framework and adjust accordingly:
- **Vue**: Use composables instead of hooks
- **Angular**: Use services and dependency injection
- **Svelte**: Use stores and reactive statements

### **For Specific AI Use Cases:**
Add to the prompt based on your needs:

```
### 🎯 **Specific Use Case:** [Choose one or more]
- Text generation and completion
- Code generation and analysis  
- Image generation (DALL-E integration)
- Chat/conversation interface
- Content summarization
- Translation services
- Sentiment analysis
- Data extraction from text
```

### **For Different Tech Stacks:**
Modify the technical requirements:

```
### 🛠️ **Tech Stack:**
- Frontend: [React/Vue/Angular/Svelte] + TypeScript
- Styling: [Tailwind/Material-UI/Chakra/Styled-Components]
- State Management: [Redux/Zustand/Context/Pinia]
- Backend: [Express/Fastify/Next.js API/Nuxt]
- Deployment: [Vercel/Netlify/Railway/Heroku]
```

## 📝 **Usage Examples:**

### **Quick Chat Interface:**
```
Add this to the base prompt:

### 💬 **Chat Interface Requirements:**
- Message history with persistent storage
- Typing indicators and message status
- Message export/import functionality
- Conversation branching and context management
- Custom system prompts per conversation
```

### **Code Generation Tool:**
```
Add this to the base prompt:

### 💻 **Code Generation Features:**
- Multiple programming language support
- Code syntax highlighting
- Copy-to-clipboard functionality
- Code explanation and documentation
- Error analysis and debugging suggestions
```

### **Content Creation Assistant:**
```
Add this to the base prompt:

### ✍️ **Content Creation Features:**
- Multiple content types (blog, social, email)
- Template system with variables
- Tone and style customization
- SEO optimization suggestions
- Content length and readability analysis
```

## 🚀 **Quick Start Commands:**

After implementation, these commands should work:

```bash
# Install dependencies
npm install

# Start AI proxy server
node server.cjs

# Start development server  
npm run dev

# Test AI integration
npm run test:ai
```

## 🔧 **Package.json Additions:**

Include these in your prompt for complete setup:

```json
{
  "scripts": {
    "ai:server": "node server.cjs",
    "ai:test": "node test-ai-connection.js",
    "dev:full": "concurrently \"npm run ai:server\" \"npm run dev\""
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
```

## 📋 **Checklist for AI Integration:**

After using the prompt, verify:

- [ ] AI service class implemented and tested
- [ ] Proxy server running on port 3001
- [ ] Credentials modal working with validation
- [ ] Both OpenAI and Anthropic providers supported
- [ ] Error handling with user notifications
- [ ] Loading states in all AI interactions
- [ ] TypeScript types for all AI interfaces
- [ ] Example usage documented
- [ ] Security best practices followed
- [ ] Production deployment ready

## 🎯 **Advanced Features Prompt Extension:**

For more sophisticated AI features, add:

```
### 🚀 **Advanced AI Features:**
- Streaming responses for real-time output
- Function calling and tool integration
- Multi-modal support (text, images, audio)
- Context window management for long conversations
- Custom fine-tuned model support
- AI model switching mid-conversation
- Usage analytics and cost tracking
- A/B testing for different prompts
- Conversation memory and personalization
- Integration with vector databases for RAG
```

---

**Save this prompt template and use it for any project that needs AI integration. Just copy the main prompt, customize it for your specific needs, and paste it into Claude or ChatGPT for instant AI functionality implementation!** 