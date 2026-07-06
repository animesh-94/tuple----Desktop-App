import { React, useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Trash2, SplitSquareHorizontal, X } from 'lucide-react';

interface Log {
  id: string;
  text: string;
  type: 'info' | 'success' | 'error' | 'input';
}

export const TerminalPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'TERMINAL' | 'OUTPUT' | 'DEBUG CONSOLE'>('TERMINAL');
  const [logs, setLogs] = useState<Log[]>([
    { id: '1', text: 'Tuple IDE v1.0.0 initialized.', type: 'info' },
    { id: '2', text: 'SQL Generator Service ready.', type: 'success' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleClear = () => {
    setLogs([]);
  };

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      const command = inputValue.trim();
      setInputValue('');

      // Add the user's input to the logs
      setLogs(prev => [...prev, { id: Date.now().toString(), text: command, type: 'input' }]);

      try {
        const result = await window.api.runCommand(command);
        if (result.stdout) {
          // Break stdout into lines
          const stdoutLines = result.stdout.trim().split('\n');
          stdoutLines.forEach((line: string, i: number) => {
            setLogs(prev => [...prev, { id: Date.now().toString() + 'out' + i, text: line, type: 'info' }]);
          });
        }
        if (result.stderr) {
          const stderrLines = result.stderr.trim().split('\n');
          stderrLines.forEach((line: string, i: number) => {
            setLogs(prev => [...prev, { id: Date.now().toString() + 'err' + i, text: line, type: 'error' }]);
          });
        }
        if (result.error) {
          setLogs(prev => [...prev, { id: Date.now().toString() + 'ex', text: String(result.error), type: 'error' }]);
        }
      } catch (err: any) {
        setLogs(prev => [...prev, { id: Date.now().toString() + 'err', text: err.message || 'Unknown error occurred.', type: 'error' }]);
      }
    }
  };

  return (
    <div className="h-48 w-full bg-[#1e1e1e] border-t border-[#3c3c3c] flex flex-col shrink-0">
      <div className="h-9 flex items-center justify-between px-4 text-[11px] uppercase tracking-wider text-[#858585] border-b border-[#3c3c3c]">
        <div className="flex h-full items-center gap-6">
          <button
            onClick={() => setActiveTab('TERMINAL')}
            className={`h-full flex items-center hover:text-[#cccccc] transition-colors ${activeTab === 'TERMINAL' ? 'text-[#cccccc] border-b border-[#007acc]' : ''}`}
          >
            TERMINAL
          </button>
          <button
            onClick={() => setActiveTab('OUTPUT')}
            className={`h-full flex items-center hover:text-[#cccccc] transition-colors ${activeTab === 'OUTPUT' ? 'text-[#cccccc] border-b border-[#007acc]' : ''}`}
          >
            OUTPUT
          </button>
          <button
            onClick={() => setActiveTab('DEBUG CONSOLE')}
            className={`h-full flex items-center hover:text-[#cccccc] transition-colors ${activeTab === 'DEBUG CONSOLE' ? 'text-[#cccccc] border-b border-[#007acc]' : ''}`}
          >
            DEBUG CONSOLE
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button title="Clear Terminal" onClick={handleClear} className="hover:text-white transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button title="Split Terminal" className="hover:text-white transition-colors">
            <SplitSquareHorizontal className="w-3.5 h-3.5" />
          </button>
          <button title="Close Terminal" className="hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 font-mono text-[12px] flex flex-col gap-1">
        {logs.map(log => (
          <div
            key={log.id}
            className={`whitespace-pre-wrap ${log.type === 'success' ? 'text-green-400' : log.type === 'error' ? 'text-red-400' : log.type === 'input' ? 'text-yellow-100' : 'text-[#cccccc]'}`}
          >
            {log.type === 'input' && <span className="text-[#007acc] mr-2">~/tuple-project $</span>}
            {log.text}
          </div>
        ))}
        <div className="flex items-center mt-1">
          <span className="text-[#007acc] mr-2 shrink-0">~/tuple-project $</span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent text-[#cccccc] font-mono border-none outline-none flex-1 min-w-0"
            autoFocus
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
