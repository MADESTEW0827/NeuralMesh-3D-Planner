import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Check, Settings, Trash2, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { GraphNode, NodeType } from '../types';

interface ApiImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (nodes: GraphNode[]) => void;
}

interface DetectedRoute {
  id: string;
  method: string;
  path: string;
  nodeName: string;
  nodeType: NodeType;
  selected: boolean;
}

const ApiImporterModal: React.FC<ApiImporterModalProps> = ({ isOpen, onClose, onImport }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [inputText, setInputText] = useState('');
  const [interpreter, setInterpreter] = useState<'auto' | 'express' | 'spring' | 'fastapi' | 'generic'>('auto');
  const [detectedRoutes, setDetectedRoutes] = useState<DetectedRoute[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setInputText(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const parseText = () => {
    const routes: DetectedRoute[] = [];
    const lines = inputText.split('\n');

    lines.forEach(line => {
      let method = '';
      let path = '';

      if (interpreter === 'express' || interpreter === 'auto') {
        const expressMatch = line.match(/(?:router|app)\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/i);
        if (expressMatch) {
          method = expressMatch[1].toUpperCase();
          path = expressMatch[2];
        }
      }
      
      if (!method && (interpreter === 'spring' || interpreter === 'auto')) {
        const springMatch = line.match(/@(Get|Post|Put|Delete|Patch)Mapping\s*\(\s*(?:value\s*=\s*)?['"]([^'"]+)['"]/i);
        if (springMatch) {
          method = springMatch[1].toUpperCase();
          path = springMatch[2];
        }
      }

      if (!method && (interpreter === 'fastapi' || interpreter === 'auto')) {
        const fastapiMatch = line.match(/@(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/i);
        if (fastapiMatch) {
          method = fastapiMatch[1].toUpperCase();
          path = fastapiMatch[2];
        }
      }

      if (!method && (interpreter === 'generic' || interpreter === 'auto')) {
        const genericMatch = line.match(/(GET|POST|PUT|DELETE|PATCH)\s+(\/[^\s"']+)/i);
        if (genericMatch) {
          method = genericMatch[1].toUpperCase();
          path = genericMatch[2];
        }
      }

      if (method && path) {
        // Evitar duplicatas exatas
        if (!routes.some(r => r.method === method && r.path === path)) {
          routes.push({
            id: uuidv4(),
            method,
            path,
            nodeName: `${method} ${path}`,
            nodeType: 'service',
            selected: true
          });
        }
      }
    });

    setDetectedRoutes(routes);
    setStep(2);
  };

  const handleImport = () => {
    const nodesToImport: GraphNode[] = detectedRoutes
      .filter(route => route.selected)
      .map(route => ({
        id: uuidv4(),
        name: route.nodeName,
        type: route.nodeType,
        description: `API Endpoint: ${route.method} ${route.path}`,
        status: 'healthy'
      }));
    
    onImport(nodesToImport);
    onClose();
    // Reset state
    setStep(1);
    setInputText('');
    setDetectedRoutes([]);
  };

  const toggleRouteSelection = (id: string) => {
    setDetectedRoutes(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  const updateRouteNodeName = (id: string, name: string) => {
    setDetectedRoutes(prev => prev.map(r => r.id === id ? { ...r, nodeName: name } : r));
  };

  const updateRouteNodeType = (id: string, type: NodeType) => {
    setDetectedRoutes(prev => prev.map(r => r.id === id ? { ...r, nodeType: type } : r));
  };

  const addManualRoute = () => {
    setDetectedRoutes(prev => [...prev, {
      id: uuidv4(),
      method: 'GET',
      path: '/nova-rota',
      nodeName: 'GET /nova-rota',
      nodeType: 'service',
      selected: true
    }]);
  };

  const removeRoute = (id: string) => {
    setDetectedRoutes(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-300 dark:border-white/10 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Importador de Rotas API</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {step === 1 ? 'Cole seu código ou importe um arquivo para extrair endpoints.' : 'Revise e ajuste as rotas identificadas antes de importar.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-600 dark:text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Interpretador (Framework/Linguagem)</label>
                  <select 
                    value={interpreter} 
                    onChange={(e) => setInterpreter(e.target.value as any)}
                    className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="auto">Auto-Detectar (Recomendado)</option>
                    <option value="express">Express.js / Node.js</option>
                    <option value="spring">Spring Boot / Java</option>
                    <option value="fastapi">FastAPI / Python</option>
                    <option value="generic">Formato Genérico (METHOD /path)</option>
                  </select>
                </div>
                
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Ou envie um arquivo</label>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden" 
                    accept=".ts,.js,.java,.py,.txt,.json" 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-white dark:bg-white/5 hover:bg-white/10 border border-slate-300 dark:border-white/10 border-dashed rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Selecionar Arquivo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Código Fonte / Texto Bruto</label>
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Cole seu código aqui... ex: router.get('/api/users', ...)"
                  className="w-full h-64 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl p-4 text-sm font-mono text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">{detectedRoutes.length}</strong> rotas detectadas.
                </span>
                <button 
                  onClick={addManualRoute}
                  className="text-xs bg-white dark:bg-white/5 hover:bg-white/10 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/10 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3 h-3" />
                  Adicionar Manualmente
                </button>
              </div>

              {detectedRoutes.length === 0 ? (
                <div className="bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl p-8 text-center">
                  <FileText className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-700 dark:text-slate-300">Nenhuma rota foi detectada.</p>
                  <p className="text-sm text-slate-500 mt-1">Verifique se o texto contém definições de endpoints reconhecíveis.</p>
                </div>
              ) : (
                <div className="bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white dark:bg-white/5 border-b border-slate-300 dark:border-white/10">
                      <tr>
                        <th className="p-3 w-10 text-center">
                          <input 
                            type="checkbox" 
                            checked={detectedRoutes.length > 0 && detectedRoutes.every(r => r.selected)}
                            onChange={(e) => setDetectedRoutes(prev => prev.map(r => ({ ...r, selected: e.target.checked })))}
                            className="rounded border-slate-600 bg-slate-800 focus:ring-blue-500"
                          />
                        </th>
                        <th className="p-3 font-semibold text-slate-700 dark:text-slate-300">Método / Caminho</th>
                        <th className="p-3 font-semibold text-slate-700 dark:text-slate-300">Nome do Nó (Visual)</th>
                        <th className="p-3 font-semibold text-slate-700 dark:text-slate-300">Tipo de Nó</th>
                        <th className="p-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {detectedRoutes.map(route => (
                        <tr key={route.id} className={route.selected ? 'bg-blue-900/10' : 'opacity-50'}>
                          <td className="p-3 text-center">
                            <input 
                              type="checkbox" 
                              checked={route.selected}
                              onChange={() => toggleRouteSelection(route.id)}
                              className="rounded border-slate-600 bg-slate-800 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-3 font-mono text-xs">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mr-2
                              ${route.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 
                                route.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400' : 
                                route.method === 'PUT' || route.method === 'PATCH' ? 'bg-amber-500/20 text-amber-400' : 
                                'bg-red-500/20 text-red-400'}`}>
                              {route.method}
                            </span>
                            <span className="text-slate-700 dark:text-slate-300">{route.path}</span>
                          </td>
                          <td className="p-3">
                            <input 
                              type="text" 
                              value={route.nodeName}
                              onChange={(e) => updateRouteNodeName(route.id, e.target.value)}
                              className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-md px-2 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                          </td>
                          <td className="p-3">
                            <select 
                              value={route.nodeType}
                              onChange={(e) => updateRouteNodeType(route.id, e.target.value as NodeType)}
                              className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-md px-2 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                            >
                              <option value="service">Serviço (API)</option>
                              <option value="gateway">API Gateway</option>
                              <option value="mobile">App Mobile</option>
                              <option value="browser">Frontend Web</option>
                              <option value="external">Sistema Externo</option>
                            </select>
                          </td>
                          <td className="p-3 text-center">
                            <button 
                              onClick={() => removeRoute(route.id)}
                              className="text-slate-500 hover:text-red-400 transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-black/20 rounded-b-2xl">
          {step === 2 ? (
            <button 
              onClick={() => setStep(1)}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-white transition-colors"
            >
              Voltar e editar texto
            </button>
          ) : (
            <div></div> // empty spacer
          )}
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            {step === 1 ? (
              <button 
                onClick={parseText}
                disabled={!inputText.trim()}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Interpretar Código
              </button>
            ) : (
              <button 
                onClick={handleImport}
                disabled={detectedRoutes.filter(r => r.selected).length === 0}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Importar {detectedRoutes.filter(r => r.selected).length} Rotas
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ApiImporterModal;
