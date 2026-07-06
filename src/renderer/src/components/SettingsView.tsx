import { useState } from 'react';
import { useSchemaStore, SqlDialect } from '../store/useSchemaStore';

export function SettingsView() {
  const [activeCategory, setActiveCategory] = useState('User Profile');
  const { dialect, setDialect } = useSchemaStore();

  const categories = [
    'User Profile',
    'AI Assistant',
    'Database',
    'Editor'
  ];

  return (
    <div className="flex h-full w-full bg-[#1e1e1e]">
      {/* Sidebar Categories */}
      <div className="w-48 bg-[#252526] flex flex-col py-2 border-r border-[#3c3c3c]">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-left px-4 py-1.5 text-[13px] ${
              activeCategory === cat 
                ? 'bg-[#37373d] text-white' 
                : 'text-[#cccccc] hover:bg-[#2a2d2e]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-xl text-[#cccccc] mb-6 border-b border-[#3c3c3c] pb-2">{activeCategory}</h2>
        
        <div className="max-w-xl space-y-6">
          {activeCategory === 'User Profile' && (
            <>
              <div className="flex flex-col space-y-2">
                <label className="text-[13px] text-[#cccccc]">Developer Name</label>
                <input type="text" className="bg-[#3c3c3c] border border-transparent focus:border-[#007acc] rounded-[2px] text-[13px] p-1.5 text-[#cccccc] outline-none" placeholder="e.g. Jane Doe" />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-[13px] text-[#cccccc]">Email Address</label>
                <input type="email" className="bg-[#3c3c3c] border border-transparent focus:border-[#007acc] rounded-[2px] text-[13px] p-1.5 text-[#cccccc] outline-none" placeholder="jane@example.com" />
              </div>
            </>
          )}

          {activeCategory === 'AI Assistant' && (
            <>
              <div className="flex flex-col space-y-2">
                <label className="text-[13px] text-[#cccccc]">OpenAI API Key</label>
                <input type="password" placeholder="sk-..." className="bg-[#3c3c3c] border border-transparent focus:border-[#007acc] rounded-[2px] text-[13px] p-1.5 text-[#cccccc] outline-none" />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-[13px] text-[#cccccc]">Anthropic API Key</label>
                <input type="password" placeholder="sk-ant-..." className="bg-[#3c3c3c] border border-transparent focus:border-[#007acc] rounded-[2px] text-[13px] p-1.5 text-[#cccccc] outline-none" />
              </div>
            </>
          )}

          {activeCategory === 'Database' && (
            <div className="flex flex-col space-y-2">
              <label className="text-[13px] text-[#cccccc]">SQL Dialect</label>
              <select 
                value={dialect}
                onChange={(e) => setDialect(e.target.value as SqlDialect)}
                className="bg-[#3c3c3c] border border-transparent focus:border-[#007acc] rounded-[2px] text-[13px] p-1.5 text-[#cccccc] outline-none"
              >
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="sqlite">SQLite</option>
              </select>
            </div>
          )}

          {activeCategory === 'Editor' && (
            <div className="space-y-4">
              <label className="flex items-center space-x-2 text-[13px] text-[#cccccc] cursor-pointer">
                <input type="checkbox" className="rounded-[2px] bg-[#3c3c3c] border-transparent text-[#007acc] focus:ring-[#007acc]" defaultChecked />
                <span>Snap to Grid</span>
              </label>
              <label className="flex items-center space-x-2 text-[13px] text-[#cccccc] cursor-pointer">
                <input type="checkbox" className="rounded-[2px] bg-[#3c3c3c] border-transparent text-[#007acc] focus:ring-[#007acc]" defaultChecked />
                <span>Show Minimap</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
