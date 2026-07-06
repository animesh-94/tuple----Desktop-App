import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { generateSchemaFromText } from '../utils/openai';
import { useSchemaStore } from '../store/useSchemaStore';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const { addTable, addRelation, tables } = useSchemaStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
      alert('Please set your OpenAI API key in Settings first.');
      return;
    }

    setLoading(true);
    try {
      const result = await generateSchemaFromText(prompt, apiKey);
      
      // Calculate starting positions to place tables nicely
      let currentX = 100;
      let currentY = 100;
      
      // We need to map the table names to their generated UUIDs to hook up relations
      const tableNameToId: Record<string, string> = {};

      result.tables.forEach((t) => {
        // Zustand doesn't let us easily intercept the generated ID when calling addTable
        // Let's rely on useSchemaStore generating ids, but wait...
        // If we use the provided store, addTable generates the ID internally.
        // For accurate relation hooking, we'll assign our own IDs directly here by dispatching to store,
        // or we can modify Zustand store to accept an ID if provided.
        // Instead of tweaking Zustand, we can just generate IDs here and add them manually.
        
        const tableId = Math.random().toString(36).substring(2, 9);
        tableNameToId[t.name] = tableId;
        
        // Add columns with IDs
        const columnsWithIds = t.columns.map(c => ({
          ...c,
          id: Math.random().toString(36).substring(2, 9)
        }));

        useSchemaStore.setState(state => ({
          tables: [...state.tables, { ...t, id: tableId, columns: columnsWithIds, position: { x: currentX, y: currentY } }]
        }));

        currentX += 300;
        if (currentX > 1000) {
          currentX = 100;
          currentY += 250;
        }
      });

      // Add relations using the stored IDs
      result.relations.forEach(r => {
        const sourceTableId = tableNameToId[r.sourceTable];
        const targetTableId = tableNameToId[r.targetTable];
        
        if (sourceTableId && targetTableId) {
          // Find the column IDs
          const sourceTableDef = useSchemaStore.getState().tables.find(t => t.id === sourceTableId);
          const targetTableDef = useSchemaStore.getState().tables.find(t => t.id === targetTableId);
          
          const sourceColId = sourceTableDef?.columns.find(c => c.name === r.sourceCol)?.id;
          const targetColId = targetTableDef?.columns.find(c => c.name === r.targetCol)?.id;

          if (sourceColId && targetColId) {
            useSchemaStore.setState(state => ({
              relations: [...state.relations, { 
                id: Math.random().toString(36).substring(2, 9),
                sourceTable: sourceTableId, 
                sourceCol: sourceColId, 
                targetTable: targetTableId, 
                targetCol: targetColId 
              }]
            }));
          }
        }
      });

      setPrompt('');
      onClose();
    } catch (e) {
      alert('Error generating schema: ' + e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-[20vh] backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-xl w-[600px] shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex items-center px-4 py-3 border-b border-zinc-800">
          <Search className="w-5 h-5 text-zinc-400 mr-3" />
          <input 
            autoFocus
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            disabled={loading}
            placeholder="e.g. Create a blog schema with users and posts..."
            className="flex-1 bg-transparent text-zinc-100 outline-none placeholder-zinc-500"
          />
          {loading && <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
        </form>
        {!loading && (
          <div className="p-3 bg-zinc-900">
            <p className="text-xs text-zinc-500 text-center">Press Enter to generate schema</p>
          </div>
        )}
      </div>
    </div>
  );
}
