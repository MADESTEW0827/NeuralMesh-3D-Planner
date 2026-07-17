import React from 'react';
import { Network, Server, ArrowRight, Zap, Box, BrainCircuit, Heart } from 'lucide-react';

interface LandingPageProps {
  onStartTemplate: () => void;
  onStartEmpty: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartTemplate, onStartEmpty }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#05070a] text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] opacity-70"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] opacity-70"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-900/5 dark:bg-black/40 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="z-10 max-w-5xl w-full px-6 flex flex-col items-center text-center py-20">
        
        {/* Logo/Icon */}
        <div className="w-24 h-24 mb-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.15)] flex items-center justify-center relative group">
          <div className="absolute inset-0 bg-blue-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
          <Network className="w-12 h-12 text-blue-600 dark:text-blue-500 relative z-10" />
        </div>

        {/* Hero Text */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
          NeuralMesh <span className="text-blue-600 dark:text-blue-500 font-light">Architecture</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-14 leading-relaxed font-light">
          Planejamento visual de microsserviços avançado. Analise gargalos, modele conexões complexas e obtenha insights arquiteturais orientados por IA para o seu ecossistema.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-5 items-center w-full max-w-lg justify-center mb-20">
          <button 
            onClick={onStartTemplate}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:-translate-y-1 flex items-center justify-center gap-3"
          >
            <Server className="w-5 h-5" />
            Explorar Modelo
          </button>
          <button 
            onClick={onStartEmpty}
            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl font-medium transition-all flex items-center justify-center gap-3 hover:-translate-y-1 shadow-sm"
          >
            Iniciar do Zero
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 w-full max-w-4xl">
          <div className="bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 text-left backdrop-blur-md hover:bg-white dark:hover:bg-slate-900/60 transition-colors">
            <Box className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Visualização Dinâmica</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-light">Alterne entre visualizações 2D e 3D para navegar pela topologia de seus serviços de forma interativa e abrangente.</p>
          </div>
          <div className="bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 text-left backdrop-blur-md hover:bg-white dark:hover:bg-slate-900/60 transition-colors">
            <Zap className="w-8 h-8 text-emerald-500 mb-4" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Análise de Fluxo</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-light">Compreenda claramente o fluxo de dados e a diferença entre chamadas síncronas e assíncronas.</p>
          </div>
          <div className="bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 text-left backdrop-blur-md hover:bg-white dark:hover:bg-slate-900/60 transition-colors">
            <BrainCircuit className="w-8 h-8 text-violet-500 mb-4" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Arquiteto IA</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-light">Receba recomendações arquiteturais precisas e insights instantâneos para escalar seu ambiente.</p>
          </div>
        </div>

        {/* Sincere Thanks */}
        <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-3xl p-8 md:p-10 max-w-3xl w-full mx-auto backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500/20" />
            Um Agradecimento Especial
          </h2>
          <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed text-center font-light">
            Gostaria de expressar minha mais sincera gratidão por você utilizar este projeto. O NeuralMesh foi criado com muita dedicação para ajudar desenvolvedores e arquitetos a visualizar e planejar sistemas complexos de forma mais intuitiva. Cada interação e cada uso me motiva a continuar melhorando esta ferramenta. Espero que ela traga enorme valor para o seu dia a dia e para a arquitetura dos seus projetos!
          </p>
        </div>

        {/* Footer/Creds */}
        <div className="mt-16 text-xs text-slate-500 dark:text-slate-500 font-mono uppercase tracking-widest">
          Enterprise Cloud Topology Designer
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
