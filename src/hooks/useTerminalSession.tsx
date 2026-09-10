import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { projects } from '@/config';
import {
  commands,
  sanitizeInput,
  isValidCommand,
  escapeHtml,
  getStatusColor,
  getProjectIdForCommand,
  type Command,
} from '@/lib/terminal-commands';

export function useTerminalSession() {
  const [history, setHistory] = useState<Command[]>([]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory([{
      command: '',
      output: ''
    }]);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const buildHistoryOutput = (trimmedCmd: string) => {
    if (trimmedCmd !== 'history') return undefined;
    return {
      output: commandHistory.length === 0 ? (
        <div className="text-[var(--terminal-text-dim)] text-sm">No commands in history yet.</div>
      ) : (
        <div className="text-sm space-y-0.5">
          {commandHistory.map((cmd, idx) => (
            <div key={idx}>
              <span className="text-[var(--terminal-text-dim)]">{String(idx + 1).padStart(3, ' ')}</span>{'  '}
              <span className="text-[var(--terminal-text)]">{escapeHtml(cmd)}</span>
            </div>
          ))}
        </div>
      ),
      description: ''
    };
  };

  const buildCatOutput = (trimmedCmd: string) => {
    if (!trimmedCmd.startsWith('cat ')) return undefined;

    const projectName = trimmedCmd.substring(4).trim();
    if (!isValidCommand(projectName)) {
      return { output: <div className="text-red-400 text-sm">Invalid project name format.</div>, description: '' };
    }

    const projectId = getProjectIdForCommand(projectName);
    if (!projectId) {
      return {
        output: (
          <div className="text-red-400 text-sm">
            Project not found. Use <span className="text-[var(--terminal-text)]">ls</span> to see available projects.
          </div>
        ),
        description: ''
      };
    }

    const project = projects.find(p => p.id === projectId);
    if (!project) return commands['cat'];

    const statusColorClass = getStatusColor(project.statusColor);
    return {
      output: (
        <div className="space-y-2 text-sm">
          <div className="text-primary font-bold text-lg mb-3">{project.name.toUpperCase()}</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div><span className="text-[var(--terminal-text-muted)]">Type:</span></div>
            <div className="text-[var(--terminal-text)]">{project.type}</div>
            <div><span className="text-[var(--terminal-text-muted)]">Status:</span></div>
            <div className={statusColorClass}>{project.status}</div>
            <div><span className="text-[var(--terminal-text-muted)]">Category:</span></div>
            <div className="text-[var(--terminal-text)]">{project.category.toUpperCase()}</div>
            <div><span className="text-[var(--terminal-text-muted)]">Visibility:</span></div>
            <div className={project.visibility === 'public' ? 'text-green-400' : 'text-red-400'}>
              {project.visibility.toUpperCase()}
            </div>
            <div><span className="text-[var(--terminal-text-muted)]">Description:</span></div>
            <div className="text-[var(--terminal-text)] col-span-2">{project.description}</div>
            {project.tags.length > 0 && (
              <>
                <div><span className="text-[var(--terminal-text-muted)]">Tags:</span></div>
                <div className="flex flex-wrap gap-1 col-span-2">
                  {project.tags.map((tag, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 rounded bg-[var(--terminal-bg)] border border-[var(--terminal-border)] text-[10px] text-[var(--terminal-text-muted)]">
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
            {project.repository && (
              <>
                <div><span className="text-[var(--terminal-text-muted)]">Repository:</span></div>
                <div className={project.visibility === 'public' ? 'text-primary break-all' : 'text-red-400'}>
                  {project.visibility === 'public' ? project.repository : 'Private repository'}
                </div>
              </>
            )}
          </div>
        </div>
      ),
      description: `Display ${project.name} details`
    };
  };

  const resolveCommandOutput = (trimmedCmd: string) => {
    const historyOutput = buildHistoryOutput(trimmedCmd);
    if (historyOutput) return historyOutput;

    const catOutput = buildCatOutput(trimmedCmd);
    if (catOutput) return catOutput;

    return commands[trimmedCmd];
  };

  const executeCommand = (cmd: string) => {
    const sanitizedCmd = sanitizeInput(cmd);
    if (!sanitizedCmd) return;

    if (!isValidCommand(sanitizedCmd)) {
      setHistory(prev => [...prev, {
        command: sanitizedCmd,
        output: (
          <div className="text-red-400 text-sm">
            Invalid command format. Only alphanumeric characters, spaces, underscores, hyphens, and forward slashes are allowed.
          </div>
        )
      }]);
      return;
    }

    const trimmedCmd = sanitizedCmd.trim().toLowerCase();
    if (!trimmedCmd) return;

    if (trimmedCmd === 'clear') {
      setHistory([]);
      return;
    }

    let commandOutput = resolveCommandOutput(trimmedCmd);

    if (!commandOutput) {
      const safeCmd = escapeHtml(trimmedCmd);
      commandOutput = {
        output: (
          <div className="text-red-400 text-sm">
            Command not found: <span className="text-[var(--terminal-text)]">{safeCmd}</span>
          </div>
        ),
        description: ''
      };
    }

    setHistory(prev => [...prev, {
      command: sanitizedCmd,
      output: commandOutput.output
    }]);

    if (trimmedCmd !== 'clear') {
      setCommandHistory(prev => [...prev, sanitizedCmd]);
      setHistoryIndex(-1);
    }
  };

  const navigateHistory = (direction: 'up' | 'down') => {
    if (direction === 'up') {
      if (commandHistory.length === 0) return;
      const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setInput(commandHistory[newIndex]);
      return;
    }

    if (historyIndex < 0) return;
    const newIndex = historyIndex + 1;
    if (newIndex >= commandHistory.length) {
      setHistoryIndex(-1);
      setInput('');
    } else {
      setHistoryIndex(newIndex);
      setInput(commandHistory[newIndex]);
    }
  };

  const autocomplete = () => {
    const sanitizedInput = sanitizeInput(input).toLowerCase();
    const matches = Object.keys(commands).filter(cmd => cmd.startsWith(sanitizedInput) && isValidCommand(cmd));

    if (matches.length === 1) {
      setInput(matches[0] + ' ');
    } else if (matches.length > 1) {
      setHistory(prev => [...prev, {
        command: sanitizedInput,
        output: (
          <div className="text-[var(--terminal-text-muted)] text-sm">
            Suggestions: <span className="text-primary">{matches.map(m => escapeHtml(m)).join(', ')}</span>
          </div>
        )
      }]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
      setHistoryIndex(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateHistory('up');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateHistory('down');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      autocomplete();
    }
  };

  const suggestions = (() => {
    if (!input) return [];
    const sanitizedInput = sanitizeInput(input).toLowerCase();
    if (!isValidCommand(sanitizedInput)) return [];
    return Object.keys(commands)
      .filter(cmd => cmd.startsWith(sanitizedInput) && cmd !== sanitizedInput && isValidCommand(cmd))
      .slice(0, 5);
  })();

  return { history, input, setInput, inputRef, terminalRef, handleKeyDown, suggestions };
}
