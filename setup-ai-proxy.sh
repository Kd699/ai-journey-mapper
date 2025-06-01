#!/bin/bash

echo "🚀 Setting up AI Proxy Server for Journey Mapper"
echo "=================================================="

# Install server dependencies
echo "📦 Installing proxy server dependencies..."
npm install express cors node-fetch

# Create package.json if it doesn't exist
if [ ! -f "package.json" ]; then
    echo "📄 Creating package.json..."
    cp server-package.json package.json
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Run: node server.js"
echo "2. Keep the proxy server running in this terminal"
echo "3. In another terminal, run your main app: npm run dev"
echo "4. Add your OpenAI or Anthropic API keys in the app"
echo "5. Enjoy real AI-powered suggestions! 🤖"
echo ""
echo "💡 The proxy server will run on http://localhost:3001"
echo "   Your main app will run on http://localhost:5173" 