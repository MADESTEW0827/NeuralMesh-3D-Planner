import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GraphData } from '../types';

interface AIAdvisorProps {
  graphData: GraphData;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ graphData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Olá! Sou o Arquiteto Sináptico. Estou aqui para ajudar a analisar e otimizar sua topologia de microsserviços. Como posso ajudar hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          graphData: graphData || { nodes: [], links: [] }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        let errorMsg = `Erro ${response.status}: Falha ao contatar a IA.`;
        try {
          const data = await response.json();
          if (data.error) errorMsg = `Erro: ${data.error}`;
        } catch (e) {
          // Response is not JSON
        }
        setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
      }
    } catch (err) {
      console.error("AIAdvisor API error:", err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erro de rede ou conexão com o servidor. Verifique sua internet e tente novamente.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={`absolute right-0 top-0 bottom-0 z-40 flex pointer-events-none transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Toggle Button - attached to the left of the sliding panel */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-300 dark:border-white/10 border-r-0 p-3 rounded-l-xl shadow-[-5px_0_15px_rgba(0,0,0,0.1)] dark:shadow-[-5px_0_15px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center gap-2 group text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        title={isOpen ? "Fechar Arquiteto" : "Abrir Arquiteto"}
      >
        <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`} />
      </button>

      {/* Sliding Panel */}
      <div className="pointer-events-auto w-80 sm:w-96 bg-slate-50 dark:bg-[#05070a] border-l border-slate-300 dark:border-white/10 flex flex-col h-full shadow-2xl">
        <div className="p-4 border-b border-slate-300 dark:border-white/10 bg-white/50 dark:bg-white/5 flex justify-between items-center backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Arquiteto Sináptico</h3>
              <p className="text-[10px] text-blue-500 dark:text-blue-400 uppercase tracking-wider font-medium">Assistente de IA</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors p-1">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-100/50 dark:bg-black/20">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : 'bg-white dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-white/10 overflow-hidden backdrop-blur-sm'
              }`}>
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  <div className="markdown-body prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl p-3 text-sm bg-white dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-white/10 flex items-center gap-2 shadow-sm backdrop-blur-sm">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-slate-500 dark:text-slate-400 text-xs italic">Analisando sinapses...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-slate-300 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ex: Como escalar o serviço de pedidos?"
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;

