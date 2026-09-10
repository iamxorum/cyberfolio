'use client';

import { contentConfig } from '@/config';
import { isValidCommand } from '@/lib/terminal-commands';
import { useTerminalSession } from '@/hooks/useTerminalSession';

export default function Terminal() {
  const { history, input, setInput, inputRef, terminalRef, handleKeyDown, suggestions } = useTerminalSession();

  return (
    <div className="p-4 rounded border border-dashed border-[var(--terminal-border)] bg-[var(--terminal-bg-dark)] font-mono text-sm text-[var(--terminal-text-muted)]">
      <div
        ref={terminalRef}
        className="max-h-64 overflow-y-auto mb-2 space-y-2"
        style={{ scrollbarWidth: 'thin' }}
      >
        {history.map((item, index) => (
          <div key={index} className="space-y-1">
            {item.command && (
              <div className="flex items-center gap-2">
                <span className="text-primary">user@system:~/projects$</span>
                <span className="text-[var(--terminal-text)]">{item.command}</span>
              </div>
            )}
            {item.output && (
              <div className="text-[var(--terminal-text-muted)] pl-4">
                {item.output}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-primary">user@system:~/projects$</span>
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            aria-label="Terminal command input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none text-[var(--terminal-text)] flex-1 w-full"
            spellCheck={false}
          />
          {suggestions.length > 0 && (
            <div className="absolute bottom-full left-0 mb-1 bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-2 text-xs space-y-1 max-w-md z-10">
              <div className="text-[var(--terminal-text-dim)] text-[10px] uppercase">Suggestions:</div>
              {suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="text-[var(--terminal-text-muted)] hover:text-primary cursor-pointer"
                  onClick={() => {
                    if (isValidCommand(suggestion)) {
                      setInput(suggestion);
                      inputRef.current?.focus();
                    }
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
        <span className="text-[var(--terminal-text)] animate-pulse">_</span>
      </div>
      {!input && (
        <div className="text-[10px] text-[var(--terminal-text-dim)] mt-2 opacity-50">
          {contentConfig.projects.terminalHint}
        </div>
      )}
    </div>
  );
}
