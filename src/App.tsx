import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import NetworkGraph from './components/NetworkGraph';
import AIAdvisor from './components/AIAdvisor';
import LandingPage from './components/LandingPage';
import ApiImporterModal from './components/ApiImporterModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GraphData, GraphNode, GraphLink } from './types';
import { Moon, Sun, Github, Lightbulb } from 'lucide-react';

// Initial dummy data for the visualizer
const initialData: GraphData = {
  nodes: [
    { id: 'gateway', name: 'API Gateway', type: 'gateway', description: 'Entrada principal para requisições externas' },
    { id: 'auth-svc', name: 'Auth Service', type: 'service', description: 'Gerencia autenticação e JWT' },
    { id: 'user-db', name: 'Banco de Usuários', type: 'database', description: 'Armazena perfis e credenciais' },
    { id: 'order-svc', name: 'Order Service', type: 'service', description: 'Gerencia pedidos de clientes' },
    { id: 'payment-svc', name: 'Payment Service', type: 'service', description: 'Processa transações financeiras' },
    { id: 'rabbitmq', name: 'RabbitMQ', type: 'queue', description: 'Barramento de eventos (Mensageria)' },
    { id: 'stripe', name: 'API do Stripe', type: 'external', description: 'Processador de pagamento externo' }
  ],
  links: [
    { id: 'l1', source: 'gateway', target: 'auth-svc', type: 'sync', label: 'Autenticar' },
    { id: 'l2', source: 'gateway', target: 'order-svc', type: 'sync', label: 'Criar Pedido' },
    { id: 'l3', source: 'auth-svc', target: 'user-db', type: 'sync', label: 'Ler/Gravar Usuário' },
    { id: 'l4', source: 'order-svc', target: 'rabbitmq', type: 'async', label: 'Evento de Pedido' },
    { id: 'l5', source: 'rabbitmq', target: 'payment-svc', type: 'async', label: 'Processar Pagamento' },
    { id: 'l6', source: 'payment-svc', target: 'stripe', type: 'sync', label: 'Cobrar Cartão' }
  ]
};

export default function App() {
  const [hasStarted, setHasStarted] = useState(() => {
    // Check if we have anything in local storage to automatically skip landing
    return !!localStorage.getItem('neuralmesh-data');
  });

  const [graphData, setGraphData] = useState<GraphData>(() => {
    const saved = localStorage.getItem('neuralmesh-data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved graph data");
      }
    }
    return initialData;
  });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isApiImporterOpen, setIsApiImporterOpen] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('neuralmesh-theme');
      if (saved) return saved === 'dark';
    }
    return true; // default to dark
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('neuralmesh-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('neuralmesh-theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (hasStarted) {
      localStorage.setItem('neuralmesh-data', JSON.stringify(graphData));
    }
  }, [graphData, hasStarted]);

  const handleStartTemplate = () => {
    setGraphData(initialData);
    setHasStarted(true);
  };

  const handleStartEmpty = () => {
    setGraphData({ nodes: [], links: [] });
    setHasStarted(true);
  };

  const handleAddNode = (newNode: GraphNode) => {
    setGraphData(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
  };

  const handleImportApiNodes = (nodes: GraphNode[]) => {
    setGraphData(prev => ({
      ...prev,
      nodes: [...prev.nodes, ...nodes]
    }));
  };

  const handleUpdateNode = (updatedNode: GraphNode) => {
    setGraphData(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === updatedNode.id ? updatedNode : n)
    }));
    setSelectedNode(updatedNode); // Update the selection to reflect changes
  };

  const handleAddLink = (newLink: GraphLink) => {
    setGraphData(prev => ({
      ...prev,
      links: [...prev.links, newLink]
    }));
  };

  const handleUpdateLink = (updatedLink: GraphLink) => {
    setGraphData(prev => ({
      ...prev,
      links: prev.links.map(l => l.id === updatedLink.id ? updatedLink : l)
    }));
  };

  const handleDeleteLink = (linkId: string) => {
    setGraphData(prev => ({
      ...prev,
      links: prev.links.filter(l => l.id !== linkId)
    }));
  };

  const handleDeleteNode = (nodeId: string) => {
    setGraphData(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      links: prev.links.filter(l => 
        (typeof l.source === 'object' ? l.source.id : l.source) !== nodeId && 
        (typeof l.target === 'object' ? l.target.id : l.target) !== nodeId
      )
    }));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
  };

  const handleClosePanel = () => {
    setSelectedNode(null);
  };

  const handleClearGraph = () => {
    setGraphData({ nodes: [], links: [] });
    setSelectedNode(null);
  };

  const handleImportGraph = (data: GraphData) => {
    setGraphData(data);
    setSelectedNode(null);
  };

  // Resizing logic
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const newWidth = Math.max(250, Math.min(e.clientX, 600));
    setSidebarWidth(newWidth);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  if (!hasStarted) {
    return <LandingPage onStartTemplate={handleStartTemplate} onStartEmpty={handleStartEmpty} />;
  }

  return (
    <div className="flex w-screen h-screen bg-slate-50 dark:bg-[#05070a] text-slate-800 dark:text-slate-200 overflow-hidden font-sans relative">
      {/* Fixed Overlapping Header */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2.5 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-300 dark:border-white/10 rounded-xl shadow-lg text-slate-700 dark:text-slate-300 hover:text-white transition-all flex items-center justify-center group"
          title={isSidebarOpen ? "Ocultar Painel" : "Mostrar Painel"}
        >
          <svg className={`w-5 h-5 transition-transform duration-300 ${isSidebarOpen ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </button>
        
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2 shadow-lg flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white leading-none">NeuralMesh</h1>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">Planejador 3D de Microsserviços</p>
          </div>
        </div>

        <a 
          href="https://github.com/superprocessador" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2.5 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 backdrop-blur-md border border-slate-300 dark:border-white/10 rounded-xl shadow-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center"
          title="GitHub do Repositório"
        >
          <Github className="w-5 h-5" />
        </a>

        <a 
          href="mailto:superprocessador@gmail.com?subject=Sugestão de Implementação - NeuralMesh"
          className="p-2.5 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 backdrop-blur-md border border-slate-300 dark:border-white/10 rounded-xl shadow-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center"
          title="Sugestão de Implementação"
        >
          <Lightbulb className="w-5 h-5" />
        </a>

        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2.5 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 backdrop-blur-md border border-slate-300 dark:border-white/10 rounded-xl shadow-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center"
          title="Alternar Tema"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button 
          onClick={() => setHasStarted(false)}
          className="p-2.5 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 backdrop-blur-md border border-slate-300 dark:border-white/10 rounded-xl shadow-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center"
          title="Início"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
        
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            const url = atob("aHR0cHM6Ly9kb25hdGUuc3RyaXBlLmNvbS8zY0kyOHI1M3ViRHczNFgzMXQwVk8wMD9jbGllbnRfcmVmZXJlbmNlX2lkPWdhcGhfaW8=");
            window.open(url, "_blank");
          }}
          className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 backdrop-blur-md border border-amber-500/30 rounded-xl shadow-lg text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-all flex items-center justify-center gap-2 font-medium text-xs"
          title="Doação para o Café"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
            <line x1="6" y1="2" x2="6" y2="4" />
            <line x1="10" y1="2" x2="10" y2="4" />
            <line x1="14" y1="2" x2="14" y2="4" />
          </svg>
          <span className="hidden sm:inline">Apoie com um Café</span>
        </a>
      </div>

      {/* Sidebar Container */}
      <div 
        className={`relative flex transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100' : 'opacity-0 -translate-x-full absolute h-full z-10'}`}
        style={{ width: isSidebarOpen ? sidebarWidth : 0 }}
      >
        <div className="w-full h-full pt-20">
          <Sidebar 
            data={graphData} 
            onAddNode={handleAddNode} 
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
            onAddLink={handleAddLink}
            onUpdateLink={handleUpdateLink}
            onDeleteLink={handleDeleteLink}
            selectedNode={selectedNode}
            onClosePanel={handleClosePanel}
            onClearGraph={handleClearGraph}
            onImportGraph={handleImportGraph}
            onOpenApiImporter={() => setIsApiImporterOpen(true)}
          />
        </div>
        
        {/* Resize Handle */}
        {isSidebarOpen && (
          <div 
            className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-500/50 transition-colors z-50"
            onMouseDown={handleMouseDown}
          />
        )}
      </div>

      <div className="flex-1 relative overflow-hidden">
        <ErrorBoundary>
          <NetworkGraph data={graphData} onNodeClick={handleNodeClick} isDarkMode={isDarkMode} />
        </ErrorBoundary>
        
        {/* Overlay instructions */}
        <div className="absolute top-4 right-4 bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-300 dark:border-white/10 p-4 rounded-2xl shadow-2xl pointer-events-none z-20">
          <p className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] inline-block"></span> Clique esquerdo e arraste para rotacionar
          </p>
          <p className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] inline-block"></span> Role para dar zoom
          </p>
          <p className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_#8b5cf6] inline-block"></span> Clique no nó para focar e editar
          </p>
        </div>
        <AIAdvisor graphData={graphData} />
      </div>

      <ApiImporterModal 
        isOpen={isApiImporterOpen} 
        onClose={() => setIsApiImporterOpen(false)} 
        onImport={handleImportApiNodes} 
      />
    </div>
  );
}

