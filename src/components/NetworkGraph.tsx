import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import ForceGraph2D from 'react-force-graph-2d';
import { GraphData, GraphNode, GraphLink } from '../types';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import { ZoomIn, ZoomOut, Focus, Camera, Box, Square } from 'lucide-react';

interface NetworkGraphProps {
  data: GraphData;
  onNodeClick?: (node: GraphNode) => void;
  isDarkMode?: boolean;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ data, onNodeClick, isDarkMode = true }) => {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [is3D, setIs3D] = useState(true);
  
  // State for highlighting connections
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  
  // Pre-calculate relationships to avoid O(n) lookups during render
  const { nodeLinks, nodesById } = useMemo(() => {
    const links = new Map<string, Set<string>>();
    const nodes = new Map<string, GraphNode>();
    
    data.nodes.forEach(node => nodes.set(node.id, node));
    data.nodes.forEach(node => links.set(node.id, new Set()));
    
    data.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      links.get(sourceId)?.add(targetId);
      links.get(targetId)?.add(sourceId);
    });
    
    return { nodeLinks: links, nodesById: nodes };
  }, [data]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    const timeout = setTimeout(updateDimensions, 100);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timeout);
    };
  }, []);

  const getNodeColor = useCallback((node: GraphNode) => {
    switch (node.type) {
      case 'service': return '#3b82f6'; // Azul corporativo
      case 'database': return '#10b981'; // Verde esmeralda
      case 'gateway': return '#8b5cf6'; // Violeta
      case 'queue': return '#f59e0b'; // Laranja/Âmbar
      case 'external': return '#ef4444'; // Vermelho
      case 'cache': return '#06b6d4'; // Ciano
      case 'load_balancer': return '#eab308'; // Amarelo
      case 'browser': return '#ec4899'; // Rosa
      case 'mobile': return '#d946ef'; // Fúcsia
      case 'worker': return '#84cc16'; // Lima
      case 'ai_model': return '#a855f7'; // Roxo
      default: return '#9ca3af';
    }
  }, []);

  const getLinkColor = useCallback((link: GraphLink) => {
    return link.type === 'async' ? '#64748b' : '#94a3b8';
  }, []);

  // Determine if a node should be dimmed (when another node is hovered)
  const isNodeDimmed = useCallback((node: GraphNode) => {
    if (!hoverNode) return false;
    if (node.id === hoverNode.id) return false;
    return !nodeLinks.get(hoverNode.id)?.has(node.id);
  }, [hoverNode, nodeLinks]);

  // Determine if a link should be dimmed
  const isLinkDimmed = useCallback((link: any) => {
    if (!hoverNode) return false;
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    return sourceId !== hoverNode.id && targetId !== hoverNode.id;
  }, [hoverNode]);

  const handleNodeClick = useCallback((node: any) => {
    if (onNodeClick) {
      onNodeClick(node as GraphNode);
    }
    
    if (fgRef.current) {
      if (is3D) {
        const distance = 40;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

        fgRef.current.cameraPosition(
          { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
          node,
          1500 // Faster, smoother corporate transition
        );
      } else {
        fgRef.current.centerAt(node.x, node.y, 1500);
        fgRef.current.zoom(8, 1500);
      }
    }
  }, [onNodeClick, is3D]);

  const handleNodeHover = useCallback((node: any | null) => {
    setHoverNode(node || null);
    
    // Optional: change cursor
    if (containerRef.current) {
      containerRef.current.style.cursor = node ? 'pointer' : 'default';
    }
  }, []);

  const handleNodeDragStart = useCallback(() => {
    // Disable camera movement when starting to drag
    if (fgRef.current && is3D) {
      fgRef.current.controls().enabled = false;
    }
  }, [is3D]);

  const handleNodeDragEnd = useCallback((node: any) => {
    // Re-enable camera movement
    if (fgRef.current && is3D) {
      fgRef.current.controls().enabled = true;
    }
    // Lock node in its new position so the force engine doesn't snap it back,
    // which prevents the visual disconnect of links.
    if (node) {
      node.fx = node.x;
      node.fy = node.y;
      if (is3D) {
        node.fz = node.z;
      }
    }
  }, [is3D]);

  const handleZoomIn = useCallback(() => {
    if (fgRef.current) {
      if (is3D) {
        const currentPos = fgRef.current.cameraPosition();
        fgRef.current.cameraPosition(
          { x: currentPos.x * 0.7, y: currentPos.y * 0.7, z: currentPos.z * 0.7 },
          currentPos.lookAt,
          500
        );
      } else {
        const currentZoom = fgRef.current.zoom();
        fgRef.current.zoom(currentZoom * 1.3, 500);
      }
    }
  }, [is3D]);

  const handleZoomOut = useCallback(() => {
    if (fgRef.current) {
      if (is3D) {
        const currentPos = fgRef.current.cameraPosition();
        fgRef.current.cameraPosition(
          { x: currentPos.x * 1.3, y: currentPos.y * 1.3, z: currentPos.z * 1.3 },
          currentPos.lookAt,
          500
        );
      } else {
        const currentZoom = fgRef.current.zoom();
        fgRef.current.zoom(currentZoom * 0.7, 500);
      }
    }
  }, [is3D]);

  const handleResetCamera = useCallback(() => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(1000, 50);
    }
  }, []);

  const toggleDimension = useCallback(() => {
    setIs3D(prev => !prev);
  }, []);

  const handleExport = useCallback(() => {
    if (containerRef.current) {
      const canvas = containerRef.current.querySelector('canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.download = 'neuralmesh-export.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-50 dark:bg-[#05070a] relative">
      <div className="absolute right-6 bottom-6 z-10 flex flex-col gap-2">
        <button onClick={toggleDimension} className="p-2.5 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-300 dark:border-white/10 rounded-xl shadow-lg text-slate-700 dark:text-slate-300 hover:text-white transition-all flex items-center justify-center group relative" title={is3D ? "Mudar para 2D" : "Mudar para 3D"}>
          {is3D ? <Square className="w-5 h-5" /> : <Box className="w-5 h-5" />}
        </button>
        <button onClick={handleZoomIn} className="p-2.5 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-300 dark:border-white/10 rounded-xl shadow-lg text-slate-700 dark:text-slate-300 hover:text-white transition-all" title="Aumentar Zoom">
          <ZoomIn className="w-5 h-5" />
        </button>
        <button onClick={handleZoomOut} className="p-2.5 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-300 dark:border-white/10 rounded-xl shadow-lg text-slate-700 dark:text-slate-300 hover:text-white transition-all" title="Diminuir Zoom">
          <ZoomOut className="w-5 h-5" />
        </button>
        <button onClick={handleResetCamera} className="p-2.5 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-300 dark:border-white/10 rounded-xl shadow-lg text-slate-700 dark:text-slate-300 hover:text-white transition-all" title="Resetar Câmera">
          <Focus className="w-5 h-5" />
        </button>
        <button onClick={handleExport} className="p-2.5 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-300 dark:border-white/10 rounded-xl shadow-lg text-slate-700 dark:text-slate-300 hover:text-white transition-all" title="Exportar Imagem">
          <Camera className="w-5 h-5" />
        </button>
      </div>

      {is3D ? (
        <ForceGraph3D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={data}
          nodeLabel="name"
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          onNodeDrag={handleNodeDragStart}
          onNodeDragEnd={handleNodeDragEnd}
          // Link styling and animations
          linkColor={(link: any) => isLinkDimmed(link) ? 'rgba(148, 163, 184, 0.1)' : getLinkColor(link)}
          linkWidth={(link: any) => isLinkDimmed(link) ? 0.5 : (link.type === 'async' ? 2 : 1.5)}
          linkCurvature={(link: any) => link.type === 'async' ? 0.2 : 0}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          // Data Flow Animation (Particles)
          linkDirectionalParticles={(link: any) => isLinkDimmed(link) ? 0 : (link.type === 'async' ? 3 : 2)}
          linkDirectionalParticleWidth={(link: any) => link.type === 'async' ? 2 : 1.5}
          linkDirectionalParticleSpeed={(link: any) => link.type === 'async' ? 0.005 : 0.015}
          linkDirectionalParticleColor={(link: any) => isDarkMode ? '#ffffff' : (link.type === 'async' ? '#64748b' : '#334155')}
          // Custom Node Rendering
          nodeThreeObject={(node: any) => {
            const group = new THREE.Group();
            const gNode = node as GraphNode;
            const dimmed = isNodeDimmed(gNode);
            
            let emissiveColor = 0x000000;
            let emissiveIntensity = 0;

            if (gNode.status === 'error') {
              emissiveColor = 0xff0000;
              emissiveIntensity = 0.5;
            } else if (gNode.status === 'warning') {
              emissiveColor = 0xffaa00;
              emissiveIntensity = 0.5;
            }

            // Material with MeshPhysicalMaterial for a premium corporate look
            const material = new THREE.MeshPhysicalMaterial({ 
              color: getNodeColor(gNode),
              transparent: true,
              opacity: dimmed ? 0.1 : (gNode.status === 'error' ? 1 : 0.85),
              roughness: 0.2,
              metalness: 0.2,
              clearcoat: 1.0,
              emissive: emissiveColor,
              emissiveIntensity: emissiveIntensity
            });

            const wireframeMaterial = new THREE.LineBasicMaterial({
              color: isDarkMode ? 0xffffff : 0x000000,
              transparent: true,
              opacity: dimmed ? 0.05 : 0.2
            });

            let geometry;
            
            switch (node.type) {
              case 'database':
                geometry = new THREE.CylinderGeometry(4, 4, 8, 32);
                break;
              case 'service':
                geometry = new THREE.BoxGeometry(6, 6, 6);
                break;
              case 'gateway':
              case 'load_balancer':
                geometry = new THREE.OctahedronGeometry(5);
                break;
              case 'queue':
                // A flatter box to represent a bus/queue
                geometry = new THREE.BoxGeometry(8, 2, 8);
                break;
              case 'cache':
                geometry = new THREE.CylinderGeometry(4, 4, 3, 32);
                break;
              case 'worker':
                geometry = new THREE.BoxGeometry(4, 4, 4);
                break;
              case 'mobile':
                geometry = new THREE.BoxGeometry(3, 6, 1);
                break;
              case 'browser':
                geometry = new THREE.BoxGeometry(7, 5, 1);
                break;
              case 'ai_model':
                geometry = new THREE.DodecahedronGeometry(5);
                break;
              case 'external':
              default:
                geometry = new THREE.SphereGeometry(4, 32, 32);
                break;
            }
            
            const mesh = new THREE.Mesh(geometry, material);
            group.add(mesh);

            const edges = new THREE.EdgesGeometry(geometry);
            const line = new THREE.LineSegments(edges, wireframeMaterial);
            group.add(line);

            // Label
            if (!dimmed || hoverNode) {
              const sprite: any = new SpriteText(node.name);
              sprite.color = dimmed 
                ? (isDarkMode ? 'rgba(203, 213, 225, 0.2)' : 'rgba(15, 23, 42, 0.2)') 
                : (isDarkMode ? '#f8fafc' : '#0f172a');
              sprite.textHeight = 2.5;
              // Adjust label position based on geometry type to avoid overlapping
              const labelYOffset = node.type === 'database' ? -8 : -7;
              sprite.position.set(0, labelYOffset, 0);
              group.add(sprite);
            }
            
            return group;
          }}
          backgroundColor={isDarkMode ? "#05070a" : "#f8fafc"}
        />
      ) : (
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={data}
          nodeLabel="name"
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          onNodeDrag={handleNodeDragStart}
          onNodeDragEnd={handleNodeDragEnd}
          // Link styling
          linkColor={(link: any) => isLinkDimmed(link) ? (isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)') : getLinkColor(link)}
          linkWidth={(link: any) => isLinkDimmed(link) ? 0.5 : (link.type === 'async' ? 2 : 1.5)}
          linkCurvature={(link: any) => link.type === 'async' ? 0.2 : 0}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkDirectionalParticles={(link: any) => isLinkDimmed(link) ? 0 : (link.type === 'async' ? 3 : 2)}
          linkDirectionalParticleWidth={(link: any) => link.type === 'async' ? 2 : 1.5}
          linkDirectionalParticleSpeed={(link: any) => link.type === 'async' ? 0.005 : 0.015}
          linkDirectionalParticleColor={(link: any) => isDarkMode ? '#ffffff' : (link.type === 'async' ? '#64748b' : '#334155')}
          // Custom Node Rendering for 2D
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12/globalScale;
            ctx.font = `${fontSize}px Inter, Sans-Serif`;
            
            const gNode = node as GraphNode;
            const dimmed = isNodeDimmed(gNode);
            const color = getNodeColor(gNode);
            
            const r = 5; // Node radius

            ctx.beginPath();
            if (node.type === 'service' || node.type === 'worker') {
              ctx.rect(node.x - r, node.y - r, r * 2, r * 2);
            } else if (node.type === 'database' || node.type === 'cache') {
              // Draw a database cylinder-like shape
              ctx.rect(node.x - r, node.y - r, r * 2, r * 2);
            } else {
              ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
            }
            
            ctx.fillStyle = color;
            ctx.fill();
            
            // Add stroke
            ctx.lineWidth = 1/globalScale;
            if (gNode.status === 'error') {
               ctx.strokeStyle = '#ff0000';
               ctx.lineWidth = 2/globalScale;
            } else if (gNode.status === 'warning') {
               ctx.strokeStyle = '#ffaa00';
               ctx.lineWidth = 2/globalScale;
            } else {
               ctx.strokeStyle = isDarkMode ? '#ffffff' : '#000000';
            }
            ctx.stroke();

            // Opacity for dimmed nodes
            if (dimmed) {
              ctx.fillStyle = isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)';
              ctx.fill();
            }

            // Draw label
            if (!dimmed || hoverNode) {
              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); 

              ctx.fillStyle = isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)';
              ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y + r + 2 - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);

              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = isDarkMode ? '#f8fafc' : '#0f172a';
              ctx.fillText(label, node.x, node.y + r + 2);
            }
          }}
          backgroundColor={isDarkMode ? "#05070a" : "#f8fafc"}
        />
      )}
    </div>
  );
};

export default NetworkGraph;
