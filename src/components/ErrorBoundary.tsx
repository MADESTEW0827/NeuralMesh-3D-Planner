import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Optional: force reload if the error is non-recoverable
    // window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#05070a] p-6 text-center z-50">
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Ocorreu um erro inesperado
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8">
            Algo deu errado na renderização deste componente. Nossas sinapses falharam temporariamente.
          </p>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-4 mb-8 text-left max-w-lg w-full overflow-auto max-h-40">
            <code className="text-xs text-red-500 font-mono">
              {this.state.error?.message || 'Erro desconhecido'}
            </code>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={this.handleReset}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2 justify-center"
            >
              <RefreshCcw className="w-4 h-4" />
              Tentar Novamente
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('neuralmesh-data');
                window.location.reload();
              }}
              className="px-6 py-3 bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-800 dark:text-white border border-slate-300 dark:border-white/10 rounded-xl font-medium transition-all flex items-center gap-2 justify-center"
            >
              <RefreshCcw className="w-4 h-4 text-amber-500" />
              Restaurar Dados Originais
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
