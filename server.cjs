const express = require('express');
const cors = require('cors');
const https = require('https');
const { URL } = require('url');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Helper function to make HTTPS requests
const makeRequest = (urlString, headers, data) => {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        ...headers,
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

// Proxy endpoint for OpenAI
app.post('/api/openai', async (req, res) => {
  try {
    const { messages, apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key required' });
    }

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };

    const requestData = {
      model: 'gpt-4',
      messages: messages,
      max_tokens: 800,
      temperature: 0.7,
    };

    const response = await makeRequest('https://api.openai.com/v1/chat/completions', headers, requestData);
    
    if (response.status !== 200) {
      console.error('OpenAI API error:', response.status, response.data);
      return res.status(response.status).json(response.data);
    }

    res.json(response.data);
  } catch (error) {
    console.error('OpenAI proxy error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Proxy endpoint for Anthropic
app.post('/api/anthropic', async (req, res) => {
  try {
    const { messages, apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key required' });
    }

    const headers = {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    };

    const requestData = {
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: messages
    };

    const response = await makeRequest('https://api.anthropic.com/v1/messages', headers, requestData);
    
    if (response.status !== 200) {
      console.error('Anthropic API error:', response.status, response.data);
      return res.status(response.status).json(response.data);
    }

    res.json(response.data);
  } catch (error) {
    console.error('Anthropic proxy error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Proxy Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 Ready to proxy AI API requests and bypass CORS!`);
}); 