import { useState, useEffect } from 'react';
import { Database, Plus, Settings, HardDriveDownload, FileTerminal, Sparkles, Files, X } from 'lucide-react';
import { useSchemaStore } from './store/useSchemaStore';
import { Canvas } from './components/Canvas';
import { CommandPalette } from './components/CommandPalette';
import { PropertiesPanel } from './components/PropertiesPanel';
import { SettingsView } from './components/SettingsView';
import { TerminalPanel } from './components/TerminalPanel';
import { generateSql } from './utils/generateSql';

function App() {
  const { tables, relations, dialect, addTable } = useSchemaStore();
  const [activeTab, setActiveTab] = useState<'canvas' | 'settings'>('canvas');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddTable = () => {
    addTable({
      name: `new_table_${tables.length + 1}`,
      columns: [
        { id: '1', name: 'id', type: 'uuid', isPk: true, isNullable: false }
      ],
      position: { x: 100, y: 100 }
    });
  };

  const handleSaveProject = async () => {
    const jsonStr = JSON.stringify({ tables, relations, dialect }, null, 2);
    try {
      const success = await window.api.saveProject(jsonStr);
      if (success) alert('Project saved successfully!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportSQL = async () => {
    const { upSql, downSql } = generateSql(tables, relations, dialect);
    try {
      const success = await window.api.exportMigrations(upSql, downSql);
      if (success) alert('Migrations exported successfully!');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden text-[#cccccc] font-sans text-[13px] bg-[#1e1e1e]">
      
      {/* Top-Level Flex Container (Body) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Activity Bar (Far Left) */}
        <div className="w-12 bg-[#333333] flex flex-col items-center py-3 gap-5 shrink-0">
          <button title="Explorer" className="text-white hover:text-white transition-colors">
            <Files className="w-[22px] h-[22px]" strokeWidth={1.5} />
          </button>
          <button title="Generate Schema (⌘K)" onClick={() => setIsCommandPaletteOpen(true)} className="text-[#858585] hover:text-white transition-colors">
            <Sparkles className="w-[22px] h-[22px]" strokeWidth={1.5} />
          </button>
          <button title="Save Project" onClick={handleSaveProject} className="text-[#858585] hover:text-white transition-colors">
            <HardDriveDownload className="w-[22px] h-[22px]" strokeWidth={1.5} />
          </button>
          <button title="Export Migrations" onClick={handleExportSQL} className="text-[#858585] hover:text-white transition-colors">
            <FileTerminal className="w-[22px] h-[22px]" strokeWidth={1.5} />
          </button>
          <div className="flex-1"></div>
          <button title="Settings" onClick={() => setActiveTab('settings')} className={`${activeTab === 'settings' ? 'text-white' : 'text-[#858585]'} hover:text-white transition-colors mb-2`}>
            <Settings className="w-[22px] h-[22px]" strokeWidth={1.5} />
          </button>
        </div>

        {/* Primary Sidebar (Left) */}
        <aside className="w-64 bg-[#252526] border-r border-[#3c3c3c] flex flex-col shrink-0">
          <div className="px-4 py-3 text-[11px] font-bold tracking-wider text-[#cccccc] mb-2 flex items-center space-x-2">
            <span>EXPLORER</span>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between px-4 mb-2 group">
              <h2 className="text-xs font-semibold text-[#cccccc] uppercase flex items-center space-x-1 cursor-pointer">
                <span>TUPLE-WORKSPACE</span>
              </h2>
              <button 
                onClick={(e) => { e.stopPropagation(); handleAddTable(); }}
                className="opacity-0 group-hover:opacity-100 hover:bg-[#3c3c3c] p-0.5 rounded transition-all"
                title="New Table"
              >
                <Plus className="w-4 h-4 text-[#cccccc]" />
              </button>
            </div>
            
            <ul className="space-y-[1px]">
              {tables.map(table => (
                <li key={table.id} onClick={() => setActiveTab('canvas')} className="flex items-center px-6 py-[3px] hover:bg-[#2a2d2e] cursor-pointer text-[#cccccc] transition-colors">
                  <Database className="w-3.5 h-3.5 mr-2 text-[#007acc]" />
                  <span>{table.name}</span>
                </li>
              ))}
              {tables.length === 0 && (
                <div className="text-xs text-[#858585] italic px-6 mt-1">No tables yet</div>
              )}
            </ul>
          </div>
        </aside>

        {/* Editor Canvas (Center) */}
        <main className="flex-1 flex flex-col relative min-w-0">
          <div className="h-9 bg-[#252526] flex items-end shrink-0 overflow-x-auto no-scrollbar">
            <div 
              onClick={() => setActiveTab('canvas')} 
              className={`bg-[#1e1e1e] px-3 py-1 flex items-center gap-2 cursor-pointer h-full max-w-[200px] border-r border-[#3c3c3c] ${activeTab === 'canvas' ? 'border-t border-t-[#007acc] text-white' : 'text-[#858585] hover:bg-[#2a2d2e]'}`}
            >
              <Database className="w-3.5 h-3.5 text-[#007acc]" />
              <span className="truncate">schema.tuple</span>
            </div>
            {activeTab === 'settings' && (
              <div 
                className="bg-[#1e1e1e] border-t border-[#007acc] px-3 py-1 flex items-center gap-2 cursor-pointer h-full max-w-[200px] border-r border-[#3c3c3c] text-white"
              >
                <Settings className="w-3.5 h-3.5 text-[#cccccc]" />
                <span className="truncate">Settings</span>
                <button onClick={(e) => { e.stopPropagation(); setActiveTab('canvas'); }} className="ml-1 hover:bg-[#333333] rounded p-0.5">
                  <X className="w-3 h-3 text-[#cccccc]" />
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 relative bg-[#1e1e1e]">
            {activeTab === 'canvas' ? <Canvas /> : <SettingsView />}
          </div>
          
          {/* Bottom Panel (Collapsible - Terminal / Output) */}
          <TerminalPanel />
        </main>
        
        {/* Secondary Sidebar (Right - Inspector) */}
        {activeTab === 'canvas' && <PropertiesPanel />}
        
      </div>

      {/* Status Bar (Bottom) */}
      <div className="h-[22px] bg-[#007acc] text-white text-[11px] flex items-center px-3 justify-between select-none shrink-0">
        <div className="flex items-center space-x-4">
          <span>Ready</span>
          <span>Tuple IDE</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>UTF-8</span>
          <span>TypeScript React</span>
        </div>
      </div>

      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
    </div>
  );
}

export default App;
