import { Handle, Position } from '@xyflow/react';
import { Table, Column } from '../store/useSchemaStore';
import { Key } from 'lucide-react';

interface TableNodeProps {
  data: Table;
}

export function TableNode({ data }: TableNodeProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-md shadow-xl overflow-hidden min-w-[200px] text-sm">
      <div className="bg-zinc-800 px-3 py-2 border-b border-zinc-700 font-semibold text-zinc-100 flex items-center justify-between">
        <span>{data.name}</span>
      </div>
      <div className="flex flex-col">
        {data.columns.map((col: Column) => (
          <div key={col.id} className="relative flex items-center justify-between px-3 py-1.5 hover:bg-zinc-800/50 transition-colors group">
            <Handle 
              type="target" 
              position={Position.Left} 
              id={`${col.id}-target`}
              className="w-2 h-2 !bg-zinc-600 !border-zinc-900"
            />
            
            <div className="flex items-center space-x-2">
              {col.isPk && <Key className="w-3 h-3 text-amber-500" />}
              <span className={`font-mono ${col.isPk ? 'text-amber-100' : 'text-zinc-300'}`}>
                {col.name}
              </span>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="font-mono text-[10px] text-zinc-500 uppercase">
                {col.type}
              </span>
            </div>

            <Handle 
              type="source" 
              position={Position.Right} 
              id={`${col.id}-source`}
              className="w-2 h-2 !bg-blue-500 !border-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
