import { useSchemaStore } from '../store/useSchemaStore';
import { Plus, Trash2, X } from 'lucide-react';

export function PropertiesPanel() {
  const { 
    activeTableId, 
    tables, 
    updateTable, 
    removeTable,
    addColumn,
    updateColumn,
    removeColumn,
    setActiveTable
  } = useSchemaStore();

  const activeTable = tables.find(t => t.id === activeTableId);

  if (!activeTable) return null;

  return (
    <aside className="w-72 bg-[#252526] border-l border-[#3c3c3c] flex flex-col shrink-0">
      <div className="px-4 py-2 border-b border-[#3c3c3c] flex items-center justify-between">
        <h2 className="text-[11px] font-bold tracking-wider text-[#cccccc]">PROPERTIES</h2>
        <button onClick={() => setActiveTable(null)} className="text-[#858585] hover:text-[#cccccc]">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        <div className="mb-6">
          <label className="block text-[11px] font-semibold text-[#cccccc] mb-2 uppercase tracking-wider">Table Name</label>
          <div className="flex items-center space-x-2">
            <input 
              value={activeTable.name}
              onChange={(e) => updateTable(activeTable.id, e.target.value)}
              className="flex-1 rounded-[2px] bg-[#3c3c3c] border border-transparent focus:border-[#007acc] px-2 py-1 text-[13px] text-[#cccccc] outline-none"
            />
            <button 
              onClick={() => removeTable(activeTable.id)}
              className="p-1 text-[#f48771] hover:bg-[#3c3c3c] rounded-[2px] transition-colors"
              title="Delete Table"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[11px] font-semibold text-[#cccccc] uppercase tracking-wider">Columns</h2>
            <button 
              onClick={() => addColumn(activeTable.id, { name: 'new_column', type: 'varchar', isPk: false, isNullable: true })}
              className="flex items-center space-x-1 text-[11px] text-[#007acc] hover:text-[#4fc1ff]"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-4">
            {activeTable.columns.map(col => (
              <div key={col.id} className="bg-[#1e1e1e] border border-[#3c3c3c] rounded-[2px] p-3 space-y-3">
                <div className="flex items-center space-x-2">
                  <input 
                    value={col.name}
                    onChange={(e) => updateColumn(activeTable.id, col.id, { name: e.target.value })}
                    className="flex-1 rounded-[2px] bg-[#3c3c3c] border border-transparent focus:border-[#007acc] px-2 py-1 text-[13px] text-[#cccccc] outline-none font-mono"
                    placeholder="Column Name"
                  />
                  <button 
                    onClick={() => removeColumn(activeTable.id, col.id)}
                    className="text-[#858585] hover:text-[#f48771] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <select 
                    value={col.type}
                    onChange={(e) => updateColumn(activeTable.id, col.id, { type: e.target.value })}
                    className="flex-1 rounded-[2px] bg-[#3c3c3c] border border-transparent focus:border-[#007acc] px-2 py-1 text-[13px] text-[#cccccc] outline-none font-mono"
                  >
                    <option value="uuid">uuid</option>
                    <option value="varchar">varchar</option>
                    <option value="text">text</option>
                    <option value="integer">integer</option>
                    <option value="boolean">boolean</option>
                    <option value="timestamp">timestamp</option>
                    <option value="jsonb">jsonb</option>
                  </select>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 text-[12px] text-[#cccccc] cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={col.isPk}
                      onChange={(e) => updateColumn(activeTable.id, col.id, { isPk: e.target.checked })}
                      className="rounded-[2px] bg-[#3c3c3c] border-transparent text-[#007acc] focus:ring-[#007acc] focus:ring-offset-[#1e1e1e]"
                    />
                    <span>Primary Key</span>
                  </label>
                  <label className="flex items-center space-x-2 text-[12px] text-[#cccccc] cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={col.isNullable}
                      onChange={(e) => updateColumn(activeTable.id, col.id, { isNullable: e.target.checked })}
                      className="rounded-[2px] bg-[#3c3c3c] border-transparent text-[#007acc] focus:ring-[#007acc] focus:ring-offset-[#1e1e1e]"
                    />
                    <span>Nullable</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
