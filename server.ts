import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // AI Route
  app.post('/api/architect', async (req, res) => {
    try {
      const { prompt, graphData } = req.body;
      
      // Mock LLM Service for Architectural Advice
      const generateArchitecturalAdvice = (prompt: string, graphData: any) => {
        const nodes = graphData.nodes || [];
        const links = graphData.links || [];
        
        const nodeTypes = {
          service: nodes.filter((n: any) => n.type === 'service').length,
          database: nodes.filter((n: any) => n.type === 'database').length,
          queue: nodes.filter((n: any) => n.type === 'queue').length,
          gateway: nodes.filter((n: any) => n.type === 'gateway').length
        };

        const hasAsync = links.some((l: any) => l.type === 'async');

        return `### Análise do Arquiteto Sináptico (Serviço Local)

Recebi sua solicitação: *" ${prompt} "*

Analisando a topologia atual (**${nodes.length} nós** e **${links.length} conexões**), preparei as seguintes diretrizes para o ambiente corporativo:

#### 1. Estratégia de Escalabilidade 📈
${nodeTypes.database > 0 ? '- **Bancos de Dados**: Recomendamos implementar réplicas de leitura (Read Replicas) para distribuir a carga das consultas. O padrão CQRS pode ser ideal aqui.' : '- **Persistência**: O ecossistema atual carece de nós de banco de dados explícitos. Para escalar, considere provisionar clusters de DB distribuídos (ex: Cloud Spanner ou Aurora).'}
${nodeTypes.queue > 0 ? '- **Desacoplamento Automático**: Excelente uso de filas/mensageria. Isso garante que picos de tráfego sejam absorvidos sem sobrecarregar os serviços.' : '- **Acoplamento Síncrono**: Notei a ausência de filas (Mensageria). Introduzir nós do tipo Queue (Kafka/RabbitMQ) e Links Async prevenirá cascatas de falhas e gargalos no processamento.'}
- **Auto-Scaling**: Configure grupos de auto-scaling (HPA no Kubernetes) para os **${nodeTypes.service} serviços** de aplicação com base na utilização de CPU e memória.

#### 2. Visualização de Relações e Animações (Data Flow) 🔄
Para explicar essa arquitetura em reuniões executivas, implementamos animações visuais dinâmicas no grafo 3D:
- **Partículas Direcionais**: Os pulsos de luz fluindo entre os nós demonstram a **direção das chamadas** e requisições.
- **Diferenciação Visual Síncrono vs Assíncrono**: Partículas mais rápidas e brilhantes representam chamadas RPC/HTTP (Sync), enquanto pulsos mais lentos e espaçados demonstram streaming de eventos/filas (Async).
- **Foco Interativo**: Ao passar o mouse sobre um serviço crítico, o sistema "escurece" o resto da malha e destaca as dependências daquele serviço. Isso ajuda a mostrar o **Raio de Impacto** de uma falha.

#### 3. Implementação Corporativa 🏗️
- **API Gateway Pattern**: ${nodeTypes.gateway > 0 ? 'O Gateway atual atua como um ponto único de entrada seguro, facilitando autenticação, rate-limiting e métricas.' : 'Recomenda-se adicionar um nó do tipo API Gateway para unificar a autenticação, roteamento e rate-limiting antes que as requisições atinjam os serviços internos.'}
- **Resiliência (Circuit Breakers)**: Nas conexões "Sync" entre serviços, implemente Circuit Breakers (ex: Resilience4j ou Istio) para falhar rápido em caso de latência.
- **Observabilidade**: Centralize os logs (ELK/Datadog) e use distributed tracing (OpenTelemetry) para mapear o fluxo exato de cada requisição através destas sinapses.

*Dica: Você pode interagir com o modelo 3D clicando e arrastando os nós para reorganizar o espaço topológico durante suas explicações corporativas.*`;
      };

      // Simulate a small delay for realistic UX
      setTimeout(() => {
        res.json({ response: generateArchitecturalAdvice(prompt, graphData) });
      }, 1500);
    } catch (error: any) {
      console.error('AI Error:', error);
      res.status(500).json({ error: error.message || 'Erro interno no servidor' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
