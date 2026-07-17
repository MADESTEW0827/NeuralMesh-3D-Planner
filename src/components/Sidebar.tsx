import React, { useState, useEffect, useRef } from 'react';
import { GraphNode, GraphLink, NodeType, GraphData } from '../types';
import { Search, Plus, X, Server, Database, Cloud, Network, Settings, Save, Info, Download, Upload, Trash2, Cpu, Smartphone, Monitor, HardDrive, Brain, Layers, Activity } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface SidebarProps {
  data: GraphData;
  onAddNode: (node: GraphNode) => void;
  onUpdateNode: (node: GraphNode) => void;
  onAddLink: (link: GraphLink) => void;
  onUpdateLink: (link: GraphLink) => void;
  onDeleteLink: (linkId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  selectedNode: GraphNode | null;
  onClosePanel: () => void;
  onClearGraph: () => void;
  onImportGraph: (data: GraphData) => void;
  onOpenApiImporter: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ data, onAddNode, onUpdateNode, onAddLink, onUpdateLink, onDeleteLink, onDeleteNode, selectedNode, onClosePanel, onClearGraph, onImportGraph, onOpenApiImporter }) => {
  const [activeTab, setActiveTab] = useState<'nodes' | 'links' | 'settings'>('nodes');
  
  // Node Form State
  const [nodeName, setNodeName] = useState('');
  const [nodeType, setNodeType] = useState<NodeType>('service');
  const [nodeDesc, setNodeDesc] = useState('');
  const [nodeStatus, setNodeStatus] = useState<'healthy' | 'warning' | 'error'>('healthy');
  const [nodeSearch, setNodeSearch] = useState('');

  // Link Form State
  const [linkSource, setLinkSource] = useState('');
  const [linkTarget, setLinkTarget] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [linkType, setLinkType] = useState<'sync' | 'async'>('sync');
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  // Edit Node Form State
  const [editNodeName, setEditNodeName] = useState('');
  const [editNodeType, setEditNodeType] = useState<NodeType>('service');
  const [editNodeDesc, setEditNodeDesc] = useState('');
  const [editNodeStatus, setEditNodeStatus] = useState<'healthy' | 'warning' | 'error'>('healthy');

  useEffect(() => {
    if (selectedNode) {
      setEditNodeName(selectedNode.name);
      setEditNodeType(selectedNode.type);
      setEditNodeDesc(selectedNode.description || '');
      setEditNodeStatus(selectedNode.status || 'healthy');
    }
  }, [selectedNode]);

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeName.trim()) return;
    
    onAddNode({
      id: uuidv4(),
      name: nodeName,
      type: nodeType,
      description: nodeDesc,
      status: nodeStatus,
    });
    
    setNodeName('');
    setNodeDesc('');
    setNodeStatus('healthy');
  };

  const handleUpdateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode || !editNodeName.trim()) return;
    
    onUpdateNode({
      ...selectedNode,
      name: editNodeName,
      type: editNodeType,
      description: editNodeDesc,
      status: editNodeStatus,
    });
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkSource || !linkTarget || linkSource === linkTarget) return;
    
    if (editingLinkId) {
      onUpdateLink({
        id: editingLinkId,
        source: linkSource,
        target: linkTarget,
        label: linkLabel,
        type: linkType,
      });
      setEditingLinkId(null);
    } else {
      onAddLink({
        id: uuidv4(),
        source: linkSource,
        target: linkTarget,
        label: linkLabel,
        type: linkType,
      });
    }
    
    setLinkLabel('');
    setLinkSource('');
    setLinkTarget('');
    setLinkType('sync');
  };

  const handleEditLink = (link: GraphLink) => {
    setEditingLinkId(link.id);
    setLinkSource(typeof link.source === 'object' ? link.source.id : link.source);
    setLinkTarget(typeof link.target === 'object' ? link.target.id : link.target);
    setLinkLabel(link.label || '');
    setLinkType(link.type || 'sync');
    // Scroll up to form if needed
  };

  const handleCancelEditLink = () => {
    setEditingLinkId(null);
    setLinkLabel('');
    setLinkSource('');
    setLinkTarget('');
    setLinkType('sync');
  };

  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case 'service': return <Server className="w-4 h-4 text-blue-500" />;
      case 'database': return <Database className="w-4 h-4 text-emerald-500" />;
      case 'gateway': return <Network className="w-4 h-4 text-violet-500" />;
      case 'queue': return <Cloud className="w-4 h-4 text-amber-500" />;
      case 'external': return <Cloud className="w-4 h-4 text-red-500" />;
      case 'cache': return <HardDrive className="w-4 h-4 text-cyan-500" />;
      case 'load_balancer': return <Layers className="w-4 h-4 text-yellow-500" />;
      case 'browser': return <Monitor className="w-4 h-4 text-pink-500" />;
      case 'mobile': return <Smartphone className="w-4 h-4 text-fuchsia-500" />;
      case 'worker': return <Cpu className="w-4 h-4 text-lime-500" />;
      case 'ai_model': return <Brain className="w-4 h-4 text-purple-500" />;
      default: return <Settings className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredNodes = data.nodes.filter(node => 
    node.name.toLowerCase().includes(nodeSearch.toLowerCase()) || 
    node.type.toLowerCase().includes(nodeSearch.toLowerCase())
  );

  return (
    <div className="w-full h-full bg-slate-50 dark:bg-black/20 border-r border-slate-200 dark:border-white/5 backdrop-blur-md text-slate-800 dark:text-slate-200 flex flex-col shadow-2xl relative z-20 overflow-hidden">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-300 dark:border-white/10">
        <button 
          onClick={() => setActiveTab('nodes')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'nodes' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-600 dark:text-slate-400 hover:text-white'}`}
        >
          Nós
        </button>
        <button 
          onClick={() => setActiveTab('links')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'links' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-600 dark:text-slate-400 hover:text-white'}`}
        >
          Conexões
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'settings' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-600 dark:text-slate-400 hover:text-white'}`}
        >
          Opções
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-64">
        
        {activeTab === 'nodes' && (
          <div className="space-y-6">
            <form onSubmit={handleAddNode} className="space-y-4 bg-white dark:bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-slate-300 dark:border-white/10">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Adicionar Novo Nó</h3>
              
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Nome</label>
                <input 
                  type="text" 
                  value={nodeName}
                  onChange={(e) => setNodeName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors text-slate-900 dark:text-white"
                  placeholder="ex: Auth Service"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Tipo</label>
                <select 
                  value={nodeType}
                  onChange={(e) => setNodeType(e.target.value as NodeType)}
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors text-slate-900 dark:text-white"
                >
                  <option value="service">Serviço (API)</option>
                  <option value="database">Banco de Dados / Storage</option>
                  <option value="gateway">API Gateway</option>
                  <option value="queue">Fila de Mensagens / Broker</option>
                  <option value="cache">Cache (Redis/Memcached)</option>
                  <option value="load_balancer">Load Balancer</option>
                  <option value="worker">Worker / Background Job</option>
                  <option value="ai_model">Modelo de IA</option>
                  <option value="browser">Navegador Web</option>
                  <option value="mobile">App Mobile</option>
                  <option value="external">Sistema Externo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Status (Saúde)</label>
                <select 
                  value={nodeStatus}
                  onChange={(e) => setNodeStatus(e.target.value as any)}
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors text-slate-900 dark:text-white"
                >
                  <option value="healthy">Saudável</option>
                  <option value="warning">Alerta</option>
                  <option value="error">Erro / Offline</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Descrição (Opcional)</label>
                <textarea 
                  value={nodeDesc}
                  onChange={(e) => setNodeDesc(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors h-16 resize-none text-slate-900 dark:text-white"
                  placeholder="O que este nó faz?"
                />
              </div>

              <button 
                type="submit"
                disabled={!nodeName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:text-slate-500 text-slate-900 dark:text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Criar Nó
              </button>
            </form>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Nós Existentes ({data.nodes.length})</h3>
                <button 
                  type="button"
                  onClick={onOpenApiImporter}
                  className="text-[10px] bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 px-2 py-1 rounded border border-emerald-500/30 transition-colors flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" />
                  Importar API
                </button>
              </div>
              
              <div className="relative mb-3">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  value={nodeSearch}
                  onChange={(e) => setNodeSearch(e.target.value)}
                  placeholder="Buscar nós..."
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                {filteredNodes.map(node => (
                  <div key={node.id} className="flex items-center gap-3 bg-white dark:bg-white/5 p-2.5 rounded-lg border border-slate-300 dark:border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className={`p-1.5 bg-slate-100 dark:bg-black/40 rounded-md border ${
                      node.status === 'error' ? 'border-red-500/50 text-red-400' : 
                      node.status === 'warning' ? 'border-yellow-500/50 text-yellow-400' : 
                      'border-slate-200 dark:border-white/5'
                    }`}>
                      {getNodeIcon(node.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{node.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{node.type}</p>
                    </div>
                  </div>
                ))}
                {filteredNodes.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">Nenhum nó encontrado</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'links' && (
          <div className="space-y-6">
            <form onSubmit={handleAddLink} className="space-y-4 bg-white dark:bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-slate-300 dark:border-white/10">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {editingLinkId ? 'Editar Conexão' : 'Adicionar Nova Conexão'}
              </h3>
              
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Nó de Origem</label>
                <select 
                  value={linkSource}
                  onChange={(e) => setLinkSource(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors text-slate-900 dark:text-white"
                >
                  <option value="">Selecione a origem...</option>
                  {data.nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Nó de Destino</label>
                <select 
                  value={linkTarget}
                  onChange={(e) => setLinkTarget(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors text-slate-900 dark:text-white"
                >
                  <option value="">Selecione o destino...</option>
                  {data.nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Tipo de Conexão</label>
                <select 
                  value={linkType}
                  onChange={(e) => setLinkType(e.target.value as 'sync' | 'async')}
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors text-slate-900 dark:text-white"
                >
                  <option value="sync">Síncrona (HTTP/gRPC)</option>
                  <option value="async">Assíncrona (Event/Message)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Rótulo (Opcional)</label>
                <input 
                  type="text" 
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors text-slate-900 dark:text-white"
                  placeholder="ex: GET /users"
                />
              </div>

              <div className="flex gap-2">
                {editingLinkId && (
                  <button 
                    type="button"
                    onClick={handleCancelEditLink}
                    className="flex-1 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-900 dark:text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                )}
                <button 
                  type="submit"
                  disabled={!linkSource || !linkTarget || linkSource === linkTarget}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:text-slate-500 text-slate-900 dark:text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {editingLinkId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingLinkId ? 'Salvar' : 'Criar Conexão'}
                </button>
              </div>
            </form>

            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 block">Conexões Existentes ({data.links.length})</h3>
              <div className="space-y-2">
                {data.links.map(link => {
                  const sourceId = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source;
                  const targetId = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target;
                  
                  const sourceNode = data.nodes.find(n => n.id === sourceId);
                  const targetNode = data.nodes.find(n => n.id === targetId);

                  return (
                    <div key={link.id} className="group flex flex-col gap-1 bg-white dark:bg-white/5 p-3 rounded-lg border border-slate-300 dark:border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">{sourceNode?.name || 'Desconhecido'}</span>
                          <span className="text-[10px] text-slate-500">→</span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">{targetNode?.name || 'Desconhecido'}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEditLink(link)}
                            className="p-1 text-slate-500 hover:text-blue-500 transition-colors"
                            title="Editar"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm('Deseja realmente remover esta conexão?')) {
                                onDeleteLink(link.id);
                              }
                            }}
                            className="p-1 text-slate-500 hover:text-red-500 transition-colors"
                            title="Remover"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                         <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 px-1.5 py-0.5 rounded">{link.type === 'sync' ? 'Síncrona' : 'Assíncrona'}</span>
                         {link.label && <span className="text-[10px] text-emerald-400 truncate">{link.label}</span>}
                      </div>
                    </div>
                  )
                })}
                {data.links.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">Nenhuma conexão criada ainda</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-slate-300 dark:border-white/10 space-y-4">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Gerenciamento da Topologia</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Salve ou carregue a estrutura da sua arquitetura em formato JSON para compartilhar com outros membros do time.
              </p>

              <button 
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
                  const downloadAnchorNode = document.createElement('a');
                  downloadAnchorNode.setAttribute("href", dataStr);
                  downloadAnchorNode.setAttribute("download", "neuralmesh-architecture.json");
                  document.body.appendChild(downloadAnchorNode); // required for firefox
                  downloadAnchorNode.click();
                  downloadAnchorNode.remove();
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-900 dark:text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar JSON
              </button>

              <label className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-900 dark:text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                Importar JSON
                <input 
                  type="file" 
                  accept=".json"
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const parsedData = JSON.parse(event.target?.result as string);
                        
                        // Robust schema validation to prevent UI crashes
                        const isValidNodes = Array.isArray(parsedData.nodes) && parsedData.nodes.every((n: any) => 
                          n && typeof n === 'object' && typeof n.id === 'string' && typeof n.name === 'string'
                        );
                        
                        const isValidLinks = Array.isArray(parsedData.links) && parsedData.links.every((l: any) => 
                          l && typeof l === 'object' && typeof l.id === 'string' && 
                          (typeof l.source === 'string' || (l.source && typeof l.source === 'object' && typeof l.source.id === 'string')) &&
                          (typeof l.target === 'string' || (l.target && typeof l.target === 'object' && typeof l.target.id === 'string'))
                        );

                        if (isValidNodes && isValidLinks) {
                          onImportGraph(parsedData);
                        } else {
                          alert("Formato JSON inválido. É necessário que 'nodes' e 'links' sejam listas estruturadas corretamente com identificadores válidos.");
                        }
                      } catch (error) {
                        alert("Erro ao ler o arquivo JSON ou o arquivo está corrompido.");
                      }
                      e.target.value = '';
                    };
                    reader.readAsText(file);
                  }}
                />
              </label>

              <div className="pt-4 border-t border-slate-300 dark:border-white/10">
                <button 
                  onClick={() => {
                    if(confirm("Tem certeza que deseja apagar toda a arquitetura atual? Esta ação não pode ser desfeita.")) {
                      onClearGraph();
                    }
                  }}
                  className="w-full bg-red-900/40 hover:bg-red-800/60 border border-red-500/30 text-red-300 rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpar Malha
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Node Inspector / Editor Slide-up Panel */}
      {selectedNode && (
        <div className="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/20 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-full duration-200 max-h-[350px] overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-md">
                {getNodeIcon(selectedNode.type)}
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-white">Configurar Nó</h3>
                <p className="text-[10px] text-blue-400 tracking-wide uppercase">{selectedNode.id}</p>
              </div>
            </div>
            <button onClick={onClosePanel} className="text-slate-600 dark:text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <form onSubmit={handleUpdateNode} className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase text-slate-500 mb-1">Nome do Nó</label>
              <input 
                type="text" 
                value={editNodeName}
                onChange={(e) => setEditNodeName(e.target.value)}
                className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 transition-colors text-slate-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-[10px] uppercase text-slate-500 mb-1">Tipo</label>
              <select 
                value={editNodeType}
                onChange={(e) => setEditNodeType(e.target.value as NodeType)}
                className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 transition-colors text-slate-900 dark:text-white"
              >
                <option value="service">Serviço (API)</option>
                <option value="database">Banco de Dados</option>
                <option value="gateway">API Gateway</option>
                <option value="queue">Fila de Mensagens</option>
                <option value="cache">Cache</option>
                <option value="load_balancer">Load Balancer</option>
                <option value="worker">Worker</option>
                <option value="ai_model">Modelo de IA</option>
                <option value="browser">Navegador Web</option>
                <option value="mobile">App Mobile</option>
                <option value="external">Sistema Externo</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase text-slate-500 mb-1">Status</label>
              <select 
                value={editNodeStatus}
                onChange={(e) => setEditNodeStatus(e.target.value as any)}
                className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 transition-colors text-slate-900 dark:text-white"
              >
                <option value="healthy">Saudável</option>
                <option value="warning">Alerta</option>
                <option value="error">Erro / Offline</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase text-slate-500 mb-1">Descrição</label>
              <textarea 
                value={editNodeDesc}
                onChange={(e) => setEditNodeDesc(e.target.value)}
                className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 transition-colors h-14 resize-none text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button 
                type="button"
                onClick={() => {
                  if (confirm('Deseja realmente remover este nó e todas as suas conexões?')) {
                    onDeleteNode(selectedNode.id);
                  }
                }}
                className="text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir
              </button>

              <button 
                type="submit"
                disabled={!editNodeName.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 text-slate-900 dark:text-white rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Salvar Alterações
              </button>
            </div>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-300 dark:border-white/10 flex gap-4">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Entrada</span>
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-bold">
                {data.links.filter(l => (typeof l.target === 'object' ? (l.target as GraphNode).id : l.target) === selectedNode.id).length}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Saída</span>
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-bold">
                {data.links.filter(l => (typeof l.source === 'object' ? (l.source as GraphNode).id : l.source) === selectedNode.id).length}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Sidebar;

