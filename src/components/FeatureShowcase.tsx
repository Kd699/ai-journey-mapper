import React, { useState } from 'react';
import { Keyboard, Save, Undo2, FileText, Sparkles, Zap } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  keys?: string[];
}

const FeatureShowcase: React.FC = () => {
  const [showShowcase, setShowShowcase] = useState(false);

  const features: Feature[] = [
    {
      icon: <Keyboard className="w-6 h-6" />,
      title: "Keyboard Navigation",
      description: "Use 1-5 to select suggestions, A to zoom in, B to backtrack",
      keys: ["1-5", "A", "B"]
    },
    {
      icon: <Save className="w-6 h-6" />,
      title: "Auto-Save",
      description: "Your journey is automatically saved to local storage",
    },
    {
      icon: <Undo2 className="w-6 h-6" />,
      title: "Undo/Redo",
      description: "Full history management with Ctrl+Z and Ctrl+Y",
      keys: ["Ctrl+Z", "Ctrl+Y"]
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Journey Templates",
      description: "Start quickly with pre-built templates for common scenarios",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Smart Suggestions",
      description: "Context-aware AI suggestions that adapt to your journey type",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Enhanced UX",
      description: "Improved animations, progress tracking, and achievement system",
    }
  ];

  if (!showShowcase) {
    return (
      <button
        onClick={() => setShowShowcase(true)}
        className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40"
        title="Show New Features"
      >
        <Sparkles className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-96 overflow-y-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold gradient-text mb-2">✨ Enhanced Features</h2>
          <p className="text-gray-600">Your Journey Mapper just got a major upgrade!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                {feature.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                {feature.keys && (
                  <div className="flex flex-wrap gap-1">
                    {feature.keys.map((key, keyIndex) => (
                      <span
                        key={keyIndex}
                        className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded font-mono"
                      >
                        {key}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => setShowShowcase(false)}
            className="btn-primary"
          >
            Start Exploring
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase; 