import React, { useState, useEffect } from 'react';
import { Send, Brain, Menu, X, FileText, Download, Share2, Undo2, Redo2, Zap, History, Folder } from 'lucide-react';
import MermaidFlowchart from './components/MermaidFlowchart';
import APICredentialsModal from './components/APICredentialsModal';
import { aiService, type AIGeneratedSuggestion, type AICredentials } from './services/aiService';

interface JourneyStep {
  id: string;
  text: string;
  level: number;
  parent?: string;
  timestamp: number;
}

interface Suggestion {
  id: number;
  text: string;
  reasoning?: string;
  confidence?: number;
  isAI?: boolean;
}

interface JourneyTemplate {
  id: string;
  name: string;
  description: string;
  context: string;
  icon: string;
}

interface SavedProject {
  id: string;
  name: string;
  context: string;
  steps: JourneyStep[];
  lastModified: number;
  isTemplate?: boolean;
}

const App: React.FC = () => {
  const [context, setContext] = useState('');
  const [journeySteps, setJourneySteps] = useState<JourneyStep[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showPastProjects, setShowPastProjects] = useState(false);
  const [history, setHistory] = useState<JourneyStep[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showAIModal, setShowAIModal] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [sideMenuOpen, setSideMenuOpen] = useState(true);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);

  // Journey Templates (now included in past projects)
  const templates: JourneyTemplate[] = [
    {
      id: 'ecommerce',
      name: 'E-commerce',
      description: 'Shopping experience',
      context: 'E-commerce platform for online shopping with product catalog, cart, and checkout',
      icon: '🛒'
    },
    {
      id: 'saas',
      name: 'SaaS App',
      description: 'Software onboarding',
      context: 'SaaS application with user registration, setup wizard, and feature introduction',
      icon: '💼'
    },
    {
      id: 'mobile',
      name: 'Mobile App',
      description: 'Mobile user journey',
      context: 'Mobile application with splash screen, login, and core feature navigation',
      icon: '📱'
    },
    {
      id: 'website',
      name: 'Website',
      description: 'Marketing website',
      context: 'Marketing website with landing pages, content sections, and conversion funnels',
      icon: '🌐'
    }
  ];

  // Load saved data on component mount
  useEffect(() => {
    const savedJourney = localStorage.getItem('journeyMapper_steps');
    const savedContext = localStorage.getItem('journeyMapper_context');
    const savedProjectsData = localStorage.getItem('journeyMapper_projects');
    
    if (savedJourney) {
      const steps = JSON.parse(savedJourney);
      setJourneySteps(steps);
      if (steps.length > 0) {
        setShowSuggestions(true);
        generateSuggestions(savedContext || '', steps);
      }
    }
    if (savedContext) setContext(savedContext);
    
    // Load saved projects or initialize with templates
    if (savedProjectsData) {
      setSavedProjects(JSON.parse(savedProjectsData));
    } else {
      // Initialize with templates
      const templateProjects: SavedProject[] = templates.map(template => ({
        id: template.id,
        name: template.name,
        context: template.context,
        steps: [],
        lastModified: Date.now(),
        isTemplate: true
      }));
      setSavedProjects(templateProjects);
      localStorage.setItem('journeyMapper_projects', JSON.stringify(templateProjects));
    }
  }, []);

  // Save projects whenever savedProjects changes
  useEffect(() => {
    localStorage.setItem('journeyMapper_projects', JSON.stringify(savedProjects));
  }, [savedProjects]);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('journeyMapper_steps', JSON.stringify(journeySteps));
    localStorage.setItem('journeyMapper_context', context);
    
    // Auto-save current project
    if (context.trim() && journeySteps.length > 0) {
      const currentProject: SavedProject = {
        id: 'current_' + Date.now(),
        name: context.length > 30 ? context.substring(0, 30) + '...' : context,
        context,
        steps: journeySteps,
        lastModified: Date.now()
      };
      
      // Update saved projects (keep only one current project)
      setSavedProjects(prev => {
        const filtered = prev.filter(p => !p.id.startsWith('current_'));
        return [currentProject, ...filtered];
      });
    }
  }, [journeySteps, context]);

  // History management
  useEffect(() => {
    if (journeySteps.length > 0) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push([...journeySteps]);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [journeySteps.length]);

  // AI-first suggestions with helpful fallbacks
  const generateSuggestions = async (context: string, history: JourneyStep[]): Promise<void> => {
    if (!aiService.hasValidCredentials()) {
      // Show helpful fallback suggestions to guide users to set up AI
      const fallbackSuggestions: Suggestion[] = [
        { id: 1, text: "Setup AI credentials for smart suggestions", isAI: false },
        { id: 2, text: "Configure OpenAI or Anthropic API", isAI: false },
        { id: 3, text: "Get intelligent journey recommendations", isAI: false }
      ];
      setSuggestions(fallbackSuggestions);
      setIsGeneratingAI(false);
      
      // Show helpful notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = '💡 Setup AI credentials to get intelligent journey suggestions!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 4000);
      return;
    }

    try {
      setIsGeneratingAI(true);
      const aiSuggestions = await aiService.generateSuggestions(context, history);
      const formattedSuggestions = aiSuggestions.map(s => ({ ...s, isAI: true }));
      setSuggestions(formattedSuggestions);
      setIsGeneratingAI(false);
    } catch (error) {
      console.error('AI suggestions failed:', error);
      setSuggestions([]);
      setIsGeneratingAI(false);
      
      // Show error notification with more helpful guidance
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.innerHTML = `
        <div class="font-medium">AI Request Failed</div>
        <div class="text-sm mt-1">Check: API credentials • Proxy server • Network connection</div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 6000);
    }
  };

  const handleTemplateSelect = (template: JourneyTemplate) => {
    setContext(template.context);
    setShowPastProjects(false);
    setTimeout(() => {
      handleContextSubmit(template.context);
    }, 100);
  };

  const handleProjectSelect = async (project: SavedProject) => {
    if (project.isTemplate) {
      // For templates, load context and auto-execute T command
      setContext(project.context);
      setShowPastProjects(false);
      setTimeout(async () => {
        await handleContextSubmit(project.context);
        // Auto-execute T command for templates after a short delay
        setTimeout(() => {
          if (hasAICredentials) {
            handleTransform();
          }
        }, 1000);
      }, 100);
    } else {
      // For saved projects, restore the full state
      setContext(project.context);
      setJourneySteps(project.steps);
      setShowSuggestions(project.steps.length > 0);
      setShowPastProjects(false);
      
      if (project.steps.length > 0) {
        await generateSuggestions(project.context, project.steps);
      }
    }
  };

  const handleContextSubmit = async (templateContext?: string) => {
    const contextText = templateContext || context;
    if (!contextText.trim()) return;
    
    const newStep: JourneyStep = {
      id: Date.now().toString(),
      text: `Context: ${contextText}`,
      level: 0,
      timestamp: Date.now()
    };
    
    const initialSteps = [newStep];
    setJourneySteps(initialSteps);
    setShowSuggestions(true);
    await generateSuggestions(contextText, initialSteps);
  };

  const handleSuggestionSelect = async (suggestion: Suggestion) => {
    // Handle fallback suggestions that guide users to AI setup
    if (!suggestion.isAI && suggestion.text.includes("Setup AI credentials")) {
      setShowAIModal(true);
      return;
    }
    
    if (!suggestion.isAI && (suggestion.text.includes("Configure") || suggestion.text.includes("Get intelligent"))) {
      setShowAIModal(true);
      return;
    }

    const newStep: JourneyStep = {
      id: Date.now().toString(),
      text: suggestion.text,
      level: journeySteps.length > 0 ? Math.min(journeySteps[journeySteps.length - 1].level + 1, 3) : 0,
      parent: journeySteps.length > 0 ? journeySteps[journeySteps.length - 1].id : undefined,
      timestamp: Date.now()
    };
    
    const updatedSteps = [...journeySteps, newStep];
    setJourneySteps(updatedSteps);
    // Always regenerate with AI
    await generateSuggestions(context, updatedSteps);
  };

  const handleNodeClick = async (stepId: string) => {
    const step = journeySteps.find(s => s.id === stepId);
    if (step) {
      const stepIndex = journeySteps.indexOf(step);
      const contextSteps = journeySteps.slice(0, stepIndex + 1);
      // Always regenerate with AI when clicking a node
      await generateSuggestions(context, contextSteps);
    }
  };

  const handleCustomSubmit = async () => {
    if (!customInput.trim()) return;
    
    const newStep: JourneyStep = {
      id: Date.now().toString(),
      text: customInput,
      level: journeySteps.length > 0 ? Math.min(journeySteps[journeySteps.length - 1].level + 1, 3) : 0,
      parent: journeySteps.length > 0 ? journeySteps[journeySteps.length - 1].id : undefined,
      timestamp: Date.now()
    };
    
    const updatedSteps = [...journeySteps, newStep];
    setJourneySteps(updatedSteps);
    // Always regenerate with AI
    await generateSuggestions(context, updatedSteps);
    setCustomInput('');
    setShowCustomInput(false);
  };

  const handleUndo = async () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const previousSteps = history[historyIndex - 1];
      setJourneySteps(previousSteps);
      // Always regenerate with AI
      await generateSuggestions(context, previousSteps);
    }
  };

  const handleRedo = async () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextSteps = history[historyIndex + 1];
      setJourneySteps(nextSteps);
      // Always regenerate with AI
      await generateSuggestions(context, nextSteps);
    }
  };

  // T option: Complete the entire journey
  const handleTransform = async () => {
    if (journeySteps.length === 0 || !context.trim()) return;
    
    try {
      setIsGeneratingAI(true);
      
      // Create a special prompt for journey completion
      const completionPrompt = `Based on the current user journey context and steps, generate a COMPLETE end-to-end user journey from start to finish. Include ALL logical steps needed to fully complete this user experience.

Context: ${context}

Current Journey Steps:
${journeySteps.map((step, idx) => `${idx + 1}. ${step.text}`).join('\n')}

Generate a comprehensive, complete user journey with 8-15 numbered steps (6 words max each) that covers the entire experience from beginning to end. Include the current steps and add all missing steps to create a full journey:`;

      // Use AI service to generate complete journey
      const aiSuggestions = await aiService.generateSuggestions(completionPrompt, journeySteps);
      
      if (aiSuggestions && aiSuggestions.length > 0) {
        // Convert AI suggestions to complete journey steps
        const completeJourneySteps: JourneyStep[] = aiSuggestions.map((suggestion, index) => ({
          id: `complete_${Date.now()}_${index}`,
          text: suggestion.text,
          level: Math.min(Math.floor(index / 3), 3), // Distribute across levels
          parent: index > 0 ? `complete_${Date.now()}_${index - 1}` : undefined,
          timestamp: Date.now() + index
        }));

        // Replace the current journey with the complete journey
        setJourneySteps(completeJourneySteps);
        
        // Add to history for undo functionality
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push([...completeJourneySteps]);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        
        // Generate new suggestions based on the complete journey
        await generateSuggestions(context, completeJourneySteps);
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.textContent = '✨ Complete journey generated! Full user flow mapped end-to-end.';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 4000);
        
      } else {
        throw new Error('No journey completion generated');
      }
      
    } catch (error) {
      console.error('Journey completion failed:', error);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = '❌ Journey completion failed. Please check AI configuration.';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 5000);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const clearJourney = () => {
    setJourneySteps([]);
    setContext('');
    setShowSuggestions(false);
    setHistory([]);
    setHistoryIndex(-1);
    localStorage.removeItem('journeyMapper_steps');
    localStorage.removeItem('journeyMapper_context');
  };

  const shareJourney = () => {
    const url = `${window.location.origin}?journey=${encodeURIComponent(JSON.stringify(journeySteps))}`;
    navigator.clipboard.writeText(url);
    
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = 'Journey URL copied to clipboard!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  };

  const exportFlowchart = () => {
    const exportData = {
      context: context,
      steps: journeySteps,
      metadata: {
        created: journeySteps[0]?.timestamp ? new Date(journeySteps[0].timestamp).toISOString() : new Date().toISOString(),
        exported: new Date().toISOString(),
        stepCount: journeySteps.length
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journey-flowchart-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAICredentialsSave = (credentials: AICredentials) => {
    aiService.setCredentials(credentials);
    if (journeySteps.length > 0) {
      generateSuggestions(context, journeySteps);
    }
    setShowAIModal(false);
  };

  const hasAICredentials = aiService.hasValidCredentials();

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Side Menu */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${sideMenuOpen ? 'w-80' : 'w-16'} flex-shrink-0`}>
        <div className="p-4">
          {/* Menu Toggle */}
          <div className="flex items-center justify-between mb-6">
            {sideMenuOpen && <h1 className="text-xl font-semibold text-gray-800">Journey Mapper</h1>}
            <button
              onClick={() => setSideMenuOpen(!sideMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sideMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {sideMenuOpen && (
            <>
              {/* Context Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Context
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Describe your application or user experience..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24 text-sm"
                />
                <button
                  onClick={() => handleContextSubmit()}
                  disabled={!context.trim()}
                  className="mt-2 w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  <Send className="w-4 h-4 mr-2 inline" />
                  Start Journey
                </button>
              </div>

              {/* Past Projects */}
              <div className="mb-6">
                <button
                  onClick={() => setShowPastProjects(!showPastProjects)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                >
                  <span className="flex items-center">
                    <Folder className="w-4 h-4 mr-2" />
                    Past Projects
                  </span>
                  <span className="text-gray-400">{showPastProjects ? '−' : '+'}</span>
                </button>
                
                {showPastProjects && (
                  <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                    {/* Templates Section */}
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Templates</div>
                    {savedProjects.filter(p => p.isTemplate).map((project) => {
                      const template = templates.find(t => t.id === project.id);
                      return (
                        <button
                          key={project.id}
                          onClick={() => handleProjectSelect(project)}
                          className="w-full p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors text-left text-sm"
                        >
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{template?.icon || '📋'}</span>
                            <div>
                              <div className="font-medium text-blue-800">{project.name}</div>
                              <div className="text-xs text-blue-600">{template?.description || 'Template'} • Auto-executes T</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    
                    {/* Saved Projects Section */}
                    {savedProjects.filter(p => !p.isTemplate).length > 0 && (
                      <>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 mt-4">Saved Projects</div>
                        {savedProjects.filter(p => !p.isTemplate).map((project) => (
                          <button
                            key={project.id}
                            onClick={() => handleProjectSelect(project)}
                            className="w-full p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors text-left text-sm"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <History className="w-4 h-4 mr-2 text-gray-400" />
                                <div>
                                  <div className="font-medium text-gray-800">{project.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {project.steps.length} steps • {new Date(project.lastModified).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* AI Required Notice */}
              {!hasAICredentials && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center">
                    <Brain className="w-5 h-5 text-amber-600 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-amber-800">AI Required</div>
                      <div className="text-xs text-amber-600">Setup AI credentials to generate suggestions</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAIModal(true)}
                    className="mt-2 w-full bg-amber-500 hover:bg-amber-600 text-white py-2 px-3 rounded-lg transition-colors text-sm"
                  >
                    Setup AI
                  </button>
                </div>
              )}

              {/* Suggestions */}
              {showSuggestions && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">
                      {hasAICredentials ? 'AI Suggestions' : 'Setup Suggestions'}
                    </h3>
                    {isGeneratingAI && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors text-sm ${
                          suggestion.isAI 
                            ? 'bg-green-50 hover:bg-green-100 border-green-200'
                            : 'bg-blue-50 hover:bg-blue-100 border-blue-200'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-6 h-6 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 ${
                            suggestion.isAI ? 'bg-green-500' : 'bg-blue-500'
                          }`}>
                            {suggestion.isAI ? suggestion.id : '⚙️'}
                          </div>
                          <span className="text-gray-800">{suggestion.text}</span>
                        </div>
                        {suggestion.confidence && (
                          <div className="text-xs text-gray-500 mt-1 ml-9">
                            {Math.round(suggestion.confidence * 100)}% confidence • AI Generated
                          </div>
                        )}
                        {!suggestion.isAI && (
                          <div className="text-xs text-blue-600 mt-1 ml-9">
                            Click to configure AI • Required for journey mapping
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* T Option - Complete Journey */}
                  {journeySteps.length > 0 && hasAICredentials && (
                    <button
                      onClick={handleTransform}
                      className="w-full mb-3 p-3 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg transition-colors text-sm"
                    >
                      <Zap className="w-4 h-4 mr-2 inline" />
                      T - Complete Entire Journey
                    </button>
                  )}

                  {/* Custom Input */}
                  {hasAICredentials && (
                    <button
                      onClick={() => setShowCustomInput(!showCustomInput)}
                      className="w-full p-3 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg transition-colors text-sm"
                    >
                      ✏️ Add Custom Step
                    </button>
                  )}

                  {showCustomInput && hasAICredentials && (
                    <div className="mt-3 space-y-2">
                      <input
                        type="text"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Describe your custom step..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleCustomSubmit}
                          disabled={!customInput.trim()}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-2 px-3 rounded-lg transition-colors text-sm"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setShowCustomInput(false)}
                          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <button
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className="flex-1 p-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 text-gray-600 rounded-lg transition-colors flex items-center justify-center"
                    title="Undo"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    className="flex-1 p-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 text-gray-600 rounded-lg transition-colors flex items-center justify-center"
                    title="Redo"
                  >
                    <Redo2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowAIModal(true)}
                    className={`flex-1 p-2 rounded-lg transition-colors flex items-center justify-center ${
                      hasAICredentials 
                        ? 'bg-green-100 hover:bg-green-200 text-green-800'
                        : 'bg-purple-100 hover:bg-purple-200 text-purple-800'
                    }`}
                    title={hasAICredentials ? "AI Enabled" : "Setup AI"}
                  >
                    <Brain className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={shareJourney}
                    className="flex-1 p-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors flex items-center justify-center"
                    title="Share Journey"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={exportFlowchart}
                    className="flex-1 p-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors flex items-center justify-center"
                    title="Export as JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={clearJourney}
                    className="flex-1 p-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors text-xs"
                    title="Clear Journey"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {journeySteps.length > 0 ? 'AI-Powered Journey Flowchart' : 'Start Your AI Journey'}
              </h2>
              {journeySteps.length > 0 && (
                <p className="text-sm text-gray-500">{journeySteps.length} AI-generated steps mapped</p>
              )}
            </div>
            {hasAICredentials ? (
              <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                🤖 AI Active
              </div>
            ) : (
              <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">
                💡 Setup AI for smart suggestions
              </div>
            )}
          </div>
        </div>

        {/* Flowchart */}
        <div className="flex-1 overflow-hidden p-6">
          {journeySteps.length > 0 ? (
            <div className="h-full">
              <MermaidFlowchart 
                steps={journeySteps} 
                context={context} 
                onNodeClick={handleNodeClick}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready for AI-Powered Journey Mapping?</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {hasAICredentials 
                    ? "Start by describing your application or user experience. Every step will be intelligently generated by AI."
                    : "Setup your AI credentials first, then describe your application for intelligent journey mapping."
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* API Credentials Modal */}
      <APICredentialsModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onSave={handleAICredentialsSave}
        existingCredentials={aiService.getCredentials() || undefined}
      />
    </div>
  );
};

export default App;