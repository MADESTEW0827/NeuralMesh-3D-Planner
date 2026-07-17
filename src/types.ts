export type NodeType = 'service' | 'database' | 'gateway' | 'external' | 'queue' | 'cache' | 'load_balancer' | 'browser' | 'mobile' | 'worker' | 'ai_model';

export type NodeStatus = 'healthy' | 'warning' | 'error';

export interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  description?: string;
  status?: NodeStatus;
  val?: number;
  color?: string;
  // properties added by force-graph
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
}

export interface GraphLink {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  label?: string;
  type?: 'sync' | 'async';
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
