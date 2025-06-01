import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, AlertTriangle, ExternalLink, Info } from 'lucide-react';
import { type AICredentials } from '../services/aiService';

interface APICredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (credentials: AICredentials) => void;
  existingCredentials?: AICredentials;
}

const APICredentialsModal: React.FC<APICredentialsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingCredentials
}) => {
  const [provider, setProvider] = useState<'openai' | 'anthropic'>(existingCredentials?.provider || 'openai');
  const [openaiKey, setOpenaiKey] = useState(existingCredentials?.openai || '');
  const [anthropicKey, setAnthropicKey] = useState(existingCredentials?.anthropic || '');
  const [showKeys, setShowKeys] = useState(false);

  useEffect(() => {
    if (existingCredentials) {
      setProvider(existingCredentials.provider);
      setOpenaiKey(existingCredentials.openai || '');
      setAnthropicKey(existingCredentials.anthropic || '');
    }
  }, [existingCredentials]);

  const handleSave = () => {
    const credentials: AICredentials = {
      provider,
      openai: openaiKey.trim() || undefined,
      anthropic: anthropicKey.trim() || undefined
    };

    // Validate that at least one key is provided for the selected provider
    if (provider === 'openai' && !credentials.openai) {
      alert('Please provide an OpenAI API key');
      return;
    }
    if (provider === 'anthropic' && !credentials.anthropic) {
      alert('Please provide an Anthropic API key');
      return;
    }

    onSave(credentials);
    onClose();
  };

  const isValid = () => {
    if (provider === 'openai') return openaiKey.trim().length > 0;
    return anthropicKey.trim().length > 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">AI Configuration</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* CORS Warning */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-amber-800 mb-2">Browser Limitation Notice</h3>
                <p className="text-sm text-amber-700 mb-3">
                  Due to CORS (Cross-Origin Resource Sharing) policies, direct API calls to OpenAI/Anthropic 
                  from browsers are blocked for security reasons.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <strong>Good News:</strong> This app provides enhanced rule-based suggestions that adapt to your context, 
                      journey type, and current step. You'll still get intelligent, contextual recommendations!
                    </div>
                  </div>
                </div>
                <p className="text-xs text-amber-600">
                  To use real AI APIs, you'd need a backend server, browser extension, or deployed platform.
                </p>
              </div>
            </div>
          </div>

          {/* Provider Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose AI Provider (for future use)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setProvider('openai')}
                className={`p-4 border rounded-lg transition-all duration-200 ${
                  provider === 'openai'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-800">OpenAI</div>
                <div className="text-xs text-gray-500 mt-1">GPT-4, ChatGPT</div>
              </button>
              <button
                onClick={() => setProvider('anthropic')}
                className={`p-4 border rounded-lg transition-all duration-200 ${
                  provider === 'anthropic'
                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-800">Anthropic</div>
                <div className="text-xs text-gray-500 mt-1">Claude</div>
              </button>
            </div>
          </div>

          {/* API Key Input */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                {provider === 'openai' ? 'OpenAI API Key' : 'Anthropic API Key'}
              </label>
              <button
                onClick={() => setShowKeys(!showKeys)}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showKeys ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            
            <input
              type={showKeys ? 'text' : 'password'}
              value={provider === 'openai' ? openaiKey : anthropicKey}
              onChange={(e) => provider === 'openai' ? setOpenaiKey(e.target.value) : setAnthropicKey(e.target.value)}
              placeholder={`sk-...${provider === 'openai' ? '' : ' or your Anthropic key'}`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Keys are stored locally in your browser
              </p>
              <a
                href={provider === 'openai' 
                  ? 'https://platform.openai.com/api-keys' 
                  : 'https://console.anthropic.com/'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <span>Get API key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Current Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Current Status</h4>
            <div className="text-sm text-gray-600">
              ✨ <strong>Enhanced Rule-Based Suggestions:</strong> Active<br/>
              🤖 <strong>AI API Integration:</strong> Limited by CORS policy<br/>
              💾 <strong>Local Storage:</strong> {existingCredentials ? 'Configured' : 'Empty'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid()}
              className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
            >
              Save Configuration
            </button>
          </div>

          <p className="text-xs text-center text-gray-500 mt-4">
            Your API keys are never sent to our servers - they're stored locally for future platform compatibility.
          </p>
        </div>
      </div>
    </div>
  );
};

export default APICredentialsModal; 