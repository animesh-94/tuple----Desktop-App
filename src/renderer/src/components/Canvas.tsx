import { useCallback, useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap,
  Connection,
  Edge,
  Node,
  NodeChange
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TableNode } from './TableNode';
import { useSchemaStore } from '../store/useSchemaStore';

const nodeTypes = {
  table: TableNode,
};

export function Canvas() {
  const { tables, relations, addRelation, updateTablePosition, setActiveTable } = useSchemaStore();

  const nodes: Node[] = useMemo(() => 
    tables.map((table) => ({
      id: table.id,
      type: 'table',
      position: table.position,
      data: table,
    })), [tables]
  );

  const edges: Edge[] = useMemo(() => 
    relations.map((rel) => ({
      id: rel.id,
      source: rel.sourceTable,
      sourceHandle: `${rel.sourceCol}-source`,
      target: rel.targetTable,
      targetHandle: `${rel.targetCol}-target`,
      animated: true,
      style: { stroke: '#60a5fa' },
    })), [relations]
  );

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    // Only handle position updates to sync with Zustand
    for (const change of changes) {
      if (change.type === 'position' && change.position) {
        updateTablePosition(change.id, change.position);
      }
    }
  }, [updateTablePosition]);

  const onConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target && connection.sourceHandle && connection.targetHandle) {
      addRelation({
        sourceTable: connection.source,
        sourceCol: connection.sourceHandle.replace('-source', ''),
        targetTable: connection.target,
        targetCol: connection.targetHandle.replace('-target', ''),
      });
    }
  }, [addRelation]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setActiveTable(node.id);
  }, [setActiveTable]);

  const onPaneClick = useCallback(() => {
    setActiveTable(null);
  }, [setActiveTable]);

  return (
    <div className="w-full h-full bg-zinc-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        colorMode="dark"
      >
        <Background color="#27272a" gap={16} />
        <Controls className="!bg-zinc-900 !border-zinc-800 !fill-zinc-400" />
        <MiniMap 
          nodeColor="#27272a" 
          maskColor="rgba(9, 9, 11, 0.7)"
          className="!bg-zinc-900"
        />
      </ReactFlow>
    </div>
  );
}
