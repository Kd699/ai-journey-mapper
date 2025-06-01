import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Download, Palette, ArrowLeft } from 'lucide-react';

interface JourneyStep {
  id: string;
  text: string;
  level: number;
  parent?: string;
  timestamp: number;
}

interface MermaidFlowchartProps {
  steps: JourneyStep[];
  context: string;
  onBackToParent?: (stepId: string) => void;
  onNodeClick?: (stepId: string) => void;
}

// Generate color scheme
const generateColorScheme = (context: string) => {
  const contextLower = context.toLowerCase();
  
  if (contextLower.includes('ecommerce') || contextLower.includes('shop') || contextLower.includes('store')) {
    return {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#34d399',
      text: '#064e3b',
      gradient: ['#10b981', '#059669', '#047857', '#065f46']
    };
  } else if (contextLower.includes('saas') || contextLower.includes('software') || contextLower.includes('platform')) {
    return {
      primary: '#3b82f6',
      secondary: '#2563eb',
      accent: '#60a5fa',
      text: '#1e3a8a',
      gradient: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af']
    };
  } else if (contextLower.includes('mobile') || contextLower.includes('app')) {
    return {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#a78bfa',
      text: '#4c1d95',
      gradient: ['#8b5cf6', '#7c3aed', '#7c2d12', '#581c87']
    };
  }
  
  return {
    primary: '#6366f1',
    secondary: '#4f46e5',
    accent: '#818cf8',
    text: '#312e81',
    gradient: ['#6366f1', '#4f46e5', '#4338ca', '#3730a3']
  };
};

// Clean text for display
const cleanDisplayText = (text: string): string => {
  let cleaned = text
    .replace(/^(Context:\s*|🎯\s*|⭐\s*|💡\s*|🔍\s*|🚀\s*|⚡\s*|🎉\s*)/, '')
    .replace(/^(Deep dive:\s*)/, '')
    .trim();
  
  // Keep text reasonable length
  if (cleaned.length > 30) {
    cleaned = cleaned.substring(0, 30) + '...';
  }
  
  return cleaned;
};

const MermaidFlowchart: React.FC<MermaidFlowchartProps> = ({ 
  steps, 
  context, 
  onBackToParent, 
  onNodeClick 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [colorScheme, setColorScheme] = useState(generateColorScheme(context));
  const [currentFocusId, setCurrentFocusId] = useState<string | null>(null);
  const [renderedSteps, setRenderedSteps] = useState<JourneyStep[]>([]);

  // Load Mermaid library
  useEffect(() => {
    if (!(window as any).mermaid) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js';
      script.onload = () => {
        (window as any).mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: {
            primaryColor: colorScheme.primary,
            primaryTextColor: '#ffffff',
            primaryBorderColor: colorScheme.secondary,
            lineColor: colorScheme.accent,
            fontSize: '14px',
            fontFamily: 'Inter, system-ui, sans-serif'
          },
          flowchart: {
            nodeSpacing: 50,
            rankSpacing: 80,
            curve: 'basis',
            useMaxWidth: false,
            htmlLabels: true,
            padding: 30
          },
          securityLevel: 'loose'
        });
        setIsLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, []);

  // Generate Mermaid syntax only when steps actually change
  const generateMermaidSyntax = useCallback(() => {
    if (steps.length === 0) return '';

    let mermaidCode = 'flowchart TD\n';
    const nodeConnections: string[] = [];
    const nodeStyles: string[] = [];

    steps.forEach((step, index) => {
      const nodeId = `node_${index}`;
      const cleanText = cleanDisplayText(step.text);
      
      // Create nodes
      if (step.text.toLowerCase().includes('context:')) {
        mermaidCode += `    ${nodeId}["${cleanText}"]\n`;
      } else if (step.text.toLowerCase().includes('decision') || step.text.toLowerCase().includes('choose')) {
        mermaidCode += `    ${nodeId}{"${cleanText}"}\n`;
      } else if (step.text.toLowerCase().includes('end') || step.text.toLowerCase().includes('complete')) {
        mermaidCode += `    ${nodeId}(("${cleanText}"))\n`;
      } else {
        mermaidCode += `    ${nodeId}["${cleanText}"]\n`;
      }

      // Create connections
      if (step.parent) {
        const parentIndex = steps.findIndex(s => s.id === step.parent);
        if (parentIndex !== -1) {
          const parentNodeId = `node_${parentIndex}`;
          if (step.text.toLowerCase().includes('deep dive')) {
            nodeConnections.push(`    ${parentNodeId} -.->|"explore"| ${nodeId}`);
          } else {
            nodeConnections.push(`    ${parentNodeId} -->|"next"| ${nodeId}`);
          }
        }
      }

      // Add styling
      const colorIndex = Math.min(index, colorScheme.gradient.length - 1);
      const nodeColor = colorScheme.gradient[colorIndex];
      nodeStyles.push(`style ${nodeId} fill:${nodeColor},stroke:${colorScheme.text},stroke-width:2px,color:#ffffff,font-size:14px`);
    });

    // Add connections
    if (nodeConnections.length > 0) {
      mermaidCode += '\n';
      nodeConnections.forEach(connection => {
        mermaidCode += connection + '\n';
      });
    }

    // Add styling
    if (nodeStyles.length > 0) {
      mermaidCode += '\n';
      nodeStyles.forEach(style => {
        mermaidCode += '    ' + style + '\n';
      });
    }

    return mermaidCode;
  }, [steps, colorScheme]);

  // Only render when steps actually change in a meaningful way
  useEffect(() => {
    if (!isLoaded || !containerRef.current || steps.length === 0) return;
    
    // Check if we need to re-render (only if steps changed significantly)
    const stepsChanged = JSON.stringify(steps) !== JSON.stringify(renderedSteps);
    if (!stepsChanged) return;

    const renderChart = async () => {
      const mermaidCode = generateMermaidSyntax();
      if (!mermaidCode.trim()) return;
      
      try {
        const uniqueId = `mermaid_${Date.now()}`;
        const { svg } = await (window as any).mermaid.render(uniqueId, mermaidCode);
        
        // Clear and set new content
        containerRef.current!.innerHTML = svg;
        
        // Get the SVG element
        const svgElement = containerRef.current!.querySelector('svg');
        if (svgElement) {
          svgRef.current = svgElement as SVGSVGElement;
          
          // Set initial viewBox and dimensions
          const bbox = svgElement.getBBox();
          svgElement.setAttribute('viewBox', `${bbox.x - 20} ${bbox.y - 20} ${bbox.width + 40} ${bbox.height + 40}`);
          svgElement.style.width = '100%';
          svgElement.style.height = '100%';
          svgElement.style.maxWidth = 'none';
          svgElement.style.maxHeight = 'none';
          
          // Add click handlers to nodes
          const nodes = svgElement.querySelectorAll('.node');
          nodes.forEach((node, index) => {
            node.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              const step = steps[index];
              if (step) {
                setCurrentFocusId(step.id);
                onNodeClick?.(step.id);
              }
            });
            (node as HTMLElement).style.cursor = 'pointer';
          });
          
          // Auto-fit on first render
          if (renderedSteps.length === 0) {
            setTimeout(() => handleFitToScreen(), 100);
          }
        }
        
        setRenderedSteps([...steps]);
        
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        containerRef.current!.innerHTML = '<div class="text-red-500 p-4">Error rendering flowchart</div>';
      }
    };

    renderChart();
  }, [isLoaded, steps, colorScheme, generateMermaidSyntax, onNodeClick, renderedSteps]);

  // Apply zoom and pan transforms without re-rendering
  useEffect(() => {
    if (svgRef.current) {
      const svg = svgRef.current;
      const bbox = svg.getBBox();
      const baseViewBox = `${bbox.x - 20} ${bbox.y - 20} ${bbox.width + 40} ${bbox.height + 40}`;
      
      // Calculate scaled viewBox
      const scale = 1 / zoom;
      const scaledWidth = (bbox.width + 40) * scale;
      const scaledHeight = (bbox.height + 40) * scale;
      const scaledX = (bbox.x - 20) - (pan.x * scale);
      const scaledY = (bbox.y - 20) - (pan.y * scale);
      
      svg.setAttribute('viewBox', `${scaledX} ${scaledY} ${scaledWidth} ${scaledHeight}`);
    }
  }, [zoom, pan]);

  // Viewport controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setCurrentFocusId(null);
  };

  const handleFitToScreen = () => {
    if (!svgRef.current || !containerRef.current) return;
    
    const svg = svgRef.current;
    const container = containerRef.current;
    const bbox = svg.getBBox();
    
    const containerRect = container.getBoundingClientRect();
    const scaleX = containerRect.width / (bbox.width + 40);
    const scaleY = containerRect.height / (bbox.height + 40);
    const scale = Math.min(scaleX, scaleY, 1);
    
    setZoom(scale);
    setPan({ x: 0, y: 0 });
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setPanStart(pan);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = (e.clientX - dragStart.x) / zoom;
    const deltaY = (e.clientY - dragStart.y) / zoom;
    
    setPan({
      x: panStart.x + deltaX,
      y: panStart.y + deltaY
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const isWithinBounds = e.clientX >= rect.left && 
                          e.clientX <= rect.right && 
                          e.clientY >= rect.top && 
                          e.clientY <= rect.bottom;
    
    if (isWithinBounds) {
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.max(0.1, Math.min(5, prev * delta)));
    }
  }, []);

  // Add wheel event listener with non-passive option
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX, y: touch.clientY });
      setPanStart(pan);
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      const deltaX = (touch.clientX - dragStart.x) / zoom;
      const deltaY = (touch.clientY - dragStart.y) / zoom;
      
      setPan({
        x: panStart.x + deltaX,
        y: panStart.y + deltaY
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Color scheme cycling
  const cycleColorScheme = () => {
    const schemes = [
      generateColorScheme('ecommerce platform'),
      generateColorScheme('saas application'),
      generateColorScheme('mobile app'),
      generateColorScheme('default')
    ];
    
    const currentIndex = schemes.findIndex(s => s.primary === colorScheme.primary);
    const nextIndex = (currentIndex + 1) % schemes.length;
    setColorScheme(schemes[nextIndex]);
  };

  const exportFlowchart = () => {
    if (!svgRef.current) return;

    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = `journey-flowchart-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <p>Your flowchart will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-white border border-gray-200 overflow-hidden">
      {/* Viewport Controls */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white/90 hover:bg-white border border-gray-200 rounded-lg shadow-sm transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white/90 hover:bg-white border border-gray-200 rounded-lg shadow-sm transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFitToScreen}
          className="p-2 bg-white/90 hover:bg-white border border-gray-200 rounded-lg shadow-sm transition-colors"
          title="Fit to Screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-white/90 hover:bg-white border border-gray-200 rounded-lg shadow-sm transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={cycleColorScheme}
          className="p-2 bg-white/90 hover:bg-white border border-gray-200 rounded-lg shadow-sm transition-colors"
          title="Change Colors"
        >
          <Palette className="w-4 h-4" />
        </button>
        <button
          onClick={exportFlowchart}
          className="p-2 bg-white/90 hover:bg-white border border-gray-200 rounded-lg shadow-sm transition-colors"
          title="Export as Image"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Status Info */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 px-3 py-1 rounded-lg border border-gray-200 text-xs text-gray-600">
        Zoom: {Math.round(zoom * 100)}% | {steps.length} node{steps.length !== 1 ? 's' : ''}
      </div>

      {/* Main Container */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Mobile Instructions */}
      <div className="absolute bottom-4 left-4 right-4 z-10 md:hidden">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-800 text-center">
          💡 Pinch to zoom, drag to pan, tap nodes to interact
        </div>
      </div>
    </div>
  );
};

export default MermaidFlowchart; 