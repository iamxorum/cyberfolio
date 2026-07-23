'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { siteConfig, projects, certifications, contentConfig, education, languages, hobbies } from '@/config';


const sanitizeInput = (input: string): string => {
  
  return input
    .replace(/[<>]/g, '') 
    .replace(/javascript:/gi, '') 
    .replace(/on\w+=/gi, '') 
    .replace(/script/gi, '') 
    .replace(/eval\(/gi, '') 
    .replace(/expression\(/gi, '') 
    .trim()
    .slice(0, 200); 
};


const isValidCommand = (cmd: string): boolean => {
  
  const safePattern = /^[a-zA-Z0-9_\s\/\-]+$/;
  return safePattern.test(cmd) && cmd.length <= 200;
};


const escapeHtml = (str: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (m) => map[m]);
};

interface Command {
  command: string;
  output: string | React.ReactNode;
  description?: string;
}


const calculateAge = () => {
  const birthDate = new Date(
    siteConfig.birthDate.year,
    siteConfig.birthDate.month - 1, 
    siteConfig.birthDate.day
  );
  const today = new Date();
  
  let years = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();
  
  
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    years--;
  }
  
  
  const thisYearBirthday = new Date(today.getFullYear(), siteConfig.birthDate.month - 1, siteConfig.birthDate.day);
  if (today < thisYearBirthday) {
    thisYearBirthday.setFullYear(today.getFullYear() - 1);
  }
  const daysSinceBirthday = Math.floor((today.getTime() - thisYearBirthday.getTime()) / (1000 * 60 * 60 * 24));
  
  return `${years} yrs ${daysSinceBirthday} days`;
};

const getStatusColor = (statusColor: string | string[]): string => {
  const colorMap: Record<string, string> = {
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    blue: 'text-blue-400',
    orange: 'text-orange-400',
    red: 'text-red-400',
  };
  const color = Array.isArray(statusColor) ? statusColor[0] : statusColor;
  return colorMap[color] || 'text-[var(--terminal-text)]';
};

const getProjectIdForCommand = (projectName: string): string | null => {
  const normalized = projectName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return projects.find(p => 
    p.id.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized ||
    p.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized
  )?.id || null;
};

const commands: Record<string, { output: string | React.ReactNode; description: string }> = {
  help: {
    output: (
      <div className="space-y-1">
        <div className="text-primary font-bold mb-2">Available commands:</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <div><span className="text-primary">help</span>          <span className="text-[var(--terminal-text-dim)] ml-4">- Show this help message</span></div>
          <div><span className="text-primary">info</span>          <span className="text-[var(--terminal-text-dim)] ml-4">- Display personal information</span></div>
          <div><span className="text-primary">ls</span>            <span className="text-[var(--terminal-text-dim)] ml-4">- List all projects</span></div>
          <div><span className="text-primary">cat [project]</span>    <span className="text-[var(--terminal-text-dim)] ml-4">- Display project details</span></div>
          <div><span className="text-primary">certs</span>         <span className="text-[var(--terminal-text-dim)] ml-4">- List certifications</span></div>
          <div><span className="text-primary">contact</span>      <span className="text-[var(--terminal-text-dim)] ml-4">- Display contact information</span></div>
          <div><span className="text-primary">clear</span>          <span className="text-[var(--terminal-text-dim)] ml-4">- Clear terminal</span></div>
          <div><span className="text-primary">whoami</span>        <span className="text-[var(--terminal-text-dim)] ml-4">- Display user information</span></div>
          <div><span className="text-primary">pwd</span>           <span className="text-[var(--terminal-text-dim)] ml-4">- Show current directory</span></div>
          <div><span className="text-primary">version</span>        <span className="text-[var(--terminal-text-dim)] ml-4">- Display system version</span></div>
          <div><span className="text-primary">neofetch</span>       <span className="text-[var(--terminal-text-dim)] ml-4">- Display system info banner</span></div>
          <div><span className="text-primary">history</span>        <span className="text-[var(--terminal-text-dim)] ml-4">- Show command history</span></div>
        </div>
        <div className="text-[var(--terminal-text-dim)] text-xs mt-3">
          Examples: <span className="text-primary">cat cyberfolio</span>, <span className="text-primary">cat pitchpulse</span>
        </div>
      </div>
    ),
    description: 'Show available commands'
  },
  info: {
    output: (
      <div className="space-y-2 text-sm">
        <div className="text-primary font-bold mb-2">Personal Information:</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div><span className="text-[var(--terminal-text-muted)]">Bio:</span></div>
          <div className="text-[var(--terminal-text)] break-words col-span-2">
            {contentConfig.about.bio.paragraphs.join(' ')}
          </div>
          {education.length > 0 && (
            <>
              <div><span className="text-[var(--terminal-text-muted)]">Education:</span></div>
              <div className="text-[var(--terminal-text)] break-words">
                {education.map(edu => edu.degree).join(', ')}
              </div>
            </>
          )}
          {languages.length > 0 && (
            <>
              <div><span className="text-[var(--terminal-text-muted)]">Languages:</span></div>
              <div className="text-[var(--terminal-text)] break-words">
                {languages.map(lang => lang.name).join(', ')}
              </div>
            </>
          )}
          {hobbies.length > 0 && (
            <>
              <div><span className="text-[var(--terminal-text-muted)]">Interests:</span></div>
              <div className="text-[var(--terminal-text)] break-words">
                {hobbies.map(hobby => hobby.name).join(', ')}
              </div>
            </>
          )}
          <div><span className="text-[var(--terminal-text-muted)]">Location:</span></div>
          <div className="text-[var(--terminal-text)]">{siteConfig.location}</div>
          <div><span className="text-[var(--terminal-text-muted)]">Status:</span></div>
          <div className="text-green-400">{siteConfig.status}</div>
        </div>
      </div>
    ),
    description: 'Display personal information'
  },
  ls: {
    output: (
      <div className="space-y-2 text-sm">
        <div className="text-primary font-bold mb-2">Projects Directory:</div>
        <div className="space-y-1">
          {projects.map((project) => {
            const statusColorClass = getStatusColor(project.statusColor);
            const projectId = project.id.toLowerCase().replace(/[^a-z0-9]/g, '_');
            return (
              <div key={project.id} className="flex items-center gap-3 flex-wrap">
                <span className="text-primary">{projectId}/</span>
                <span className="text-[var(--terminal-text-dim)]">[{project.type}]</span>
                <span className={statusColorClass}>{project.status}</span>
                {project.visibility === 'private' && (
                  <span className="text-red-400 text-xs">[PRIVATE]</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="text-[var(--terminal-text-dim)] text-xs mt-3">
          Use <span className="text-primary">cat [project_id]</span> to view details
        </div>
      </div>
    ),
    description: 'List all projects'
  },
  cat: {
    output: (
      <div className="space-y-2 text-sm">
        <div className="text-red-400">Usage: cat [project_id]</div>
        <div className="text-[var(--terminal-text-muted)]">Available projects:</div>
        <div className="space-y-1 ml-4">
          {projects.map((project) => {
            const projectId = project.id.toLowerCase().replace(/[^a-z0-9]/g, '_');
            return (
              <div key={project.id}>
                <span className="text-primary">cat {projectId}</span>
                <span className="text-[var(--terminal-text-dim)] ml-2">- View {project.name} details</span>
              </div>
            );
          })}
        </div>
      </div>
    ),
    description: 'Display project details'
  },
  whoami: {
    output: (
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div><span className="text-[var(--terminal-text-muted)]">User:</span></div>
            <div className="text-[var(--terminal-text)] font-bold">{siteConfig.username}</div>
            <div><span className="text-[var(--terminal-text-muted)]">Role:</span></div>
            <div className="text-[var(--terminal-text)]">{siteConfig.role}</div>
            <div><span className="text-[var(--terminal-text-muted)]">Age:</span></div>
            <div className="text-primary">{calculateAge()}</div>
            <div><span className="text-[var(--terminal-text-muted)]">Location:</span></div>
            <div className="text-[var(--terminal-text)]">{siteConfig.location}</div>
            <div><span className="text-[var(--terminal-text-muted)]">Status:</span></div>
            <div className="text-green-400">{siteConfig.status}</div>
          <div><span className="text-[var(--terminal-text-muted)]">Contact:</span></div>
          <div className="text-primary">Use <span className="text-[var(--terminal-text)]">contact</span> command</div>
        </div>
      </div>
    ),
    description: 'Display user information'
  },
  contact: {
    output: (
      <div className="space-y-2 text-sm">
        <div className="text-primary font-bold mb-2">Contact Information:</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {siteConfig.social.professional && siteConfig.social.professional.map((link, index) => (
            <>
              <div key={`${index}-label`}><span className="text-[var(--terminal-text-muted)]">{link.name}:</span></div>
              <div key={`${index}-value`} className="text-primary break-all">{link.url}</div>
            </>
          ))}
          {siteConfig.social.gaming && siteConfig.social.gaming.map((link, index) => (
            <>
              <div key={`gaming-${index}-label`}><span className="text-[var(--terminal-text-muted)]">{link.name}:</span></div>
              <div key={`gaming-${index}-value`} className="text-primary break-all">{link.url}</div>
            </>
          ))}
          {siteConfig.social.other && siteConfig.social.other.map((link, index) => (
            <>
              <div key={`other-${index}-label`}><span className="text-[var(--terminal-text-muted)]">{link.name}:</span></div>
              <div key={`other-${index}-value`} className="text-primary break-all">{link.url}</div>
            </>
          ))}
        </div>
      </div>
    ),
    description: 'Display contact information'
  },
  certs: {
    output: (
      <div className="space-y-2 text-sm">
        <div className="text-primary font-bold mb-2">Certifications:</div>
        {certifications.length === 0 ? (
          <div className="text-[var(--terminal-text-dim)]">No certifications available.</div>
        ) : (
          <div className="space-y-3">
            {certifications.map((cert) => (
              <div key={cert.id} className="border-l-2 border-primary pl-3 space-y-1">
                <div className="text-[var(--terminal-text)] font-bold">{cert.name}</div>
                <div className="text-[var(--terminal-text-muted)] text-xs">Issuer: {cert.issuer}</div>
                <div className="text-[var(--terminal-text-muted)] text-xs">
                  Issued: {cert.issueDate}
                  {cert.expiryDate && ` | Expires: ${cert.expiryDate}`}
                </div>
                {cert.credentialId && (
                  <div className="text-[var(--terminal-text-dim)] text-xs">ID: {cert.credentialId}</div>
                )}
                {cert.description && (
                  <div className="text-[var(--terminal-text-muted)] text-xs mt-1">{cert.description}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    description: 'List certifications'
  },
  pwd: {
    output: <div className="text-sm text-[var(--terminal-text)]">/home/iamxorum/projects</div>,
    description: 'Show current directory'
  },
  version: {
    output: (
      <div className="space-y-2 text-sm">
        <div className="text-primary font-bold mb-2">{siteConfig.domain} {siteConfig.systemVersion}</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div><span className="text-[var(--terminal-text-muted)]">Domain:</span></div>
          <div className="text-[var(--terminal-text)]">{siteConfig.domain}</div>
          <div><span className="text-[var(--terminal-text-muted)]">Version:</span></div>
          <div className="text-[var(--terminal-text)]">{siteConfig.systemVersion}</div>
          <div><span className="text-[var(--terminal-text-muted)]">Framework:</span></div>
          <div className="text-[var(--terminal-text)]">Next.js</div>
          <div><span className="text-[var(--terminal-text-muted)]">Status:</span></div>
          <div className="text-green-400">ONLINE</div>
        </div>
      </div>
    ),
    description: 'Display system version'
  },
  neofetch: {
    output: (
      <div className="flex gap-6 text-sm flex-wrap">
        <pre className="text-primary leading-tight text-[10px] sm:text-xs shrink-0">
{`    .-"-.
   /|6 6|\\
  {/(_0_)\\}
   _/ ^ \\_
  (_/   \\_)`}
        </pre>
        <div className="space-y-0.5">
          <div><span className="text-primary font-bold">{siteConfig.username}</span>@<span className="text-primary font-bold">{siteConfig.domain}</span></div>
          <div className="text-[var(--terminal-text-dim)]">-----------------------</div>
          <div><span className="text-[var(--terminal-text-muted)]">OS:</span> <span className="text-[var(--terminal-text)]">Next.js on Linux</span></div>
          <div><span className="text-[var(--terminal-text-muted)]">Role:</span> <span className="text-[var(--terminal-text)]">{siteConfig.role}</span></div>
          <div><span className="text-[var(--terminal-text-muted)]">Location:</span> <span className="text-[var(--terminal-text)]">{siteConfig.location}</span></div>
          <div><span className="text-[var(--terminal-text-muted)]">Uptime:</span> <span className="text-[var(--terminal-text)]">{calculateAge()}</span></div>
          <div><span className="text-[var(--terminal-text-muted)]">Shell:</span> <span className="text-[var(--terminal-text)]">iamxorum-term {siteConfig.systemVersion}</span></div>
          <div><span className="text-[var(--terminal-text-muted)]">Status:</span> <span className="text-green-400">{siteConfig.status}</span></div>
        </div>
      </div>
    ),
    description: 'Display system info'
  },
  sudo: {
    output: (
      <div className="text-sm space-y-1">
        <div className="text-red-400">[sudo] password for {siteConfig.username}:</div>
        <div className="text-[var(--terminal-text-muted)]">{siteConfig.username} is not in the sudoers file. This incident will be reported.</div>
      </div>
    ),
    description: ''
  },
  clear: {
    output: '',
    description: 'Clear terminal'
  }
};

export default function Terminal() {
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

  const executeCommand = (cmd: string) => {
    
    const sanitizedCmd = sanitizeInput(cmd);
    
    if (!sanitizedCmd) {
      return;
    }

    
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
    
    if (!trimmedCmd) {
      return;
    }

    
    if (trimmedCmd === 'clear') {
      setHistory([]);
      return;
    }


    let commandOutput = commands[trimmedCmd];

    if (trimmedCmd === 'history') {
      commandOutput = {
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
    }


    if (trimmedCmd.startsWith('cat ')) {
      const projectName = trimmedCmd.substring(4).trim();
      
      if (isValidCommand(projectName)) {
        const projectId = getProjectIdForCommand(projectName);
        
        if (projectId) {
          const project = projects.find(p => p.id === projectId);
          if (project) {
            const statusColorClass = getStatusColor(project.statusColor);
            commandOutput = {
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
          } else {
            commandOutput = commands['cat'];
          }
        } else {
          commandOutput = {
            output: (
              <div className="text-red-400 text-sm">
                Project not found. Use <span className="text-[var(--terminal-text)]">ls</span> to see available projects.
              </div>
            ),
            description: ''
          };
        }
      } else {
        commandOutput = {
          output: (
            <div className="text-red-400 text-sm">
              Invalid project name format.
            </div>
          ),
          description: ''
        };
      }
    }

    
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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
      setHistoryIndex(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          
          setInput(commandHistory[newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      
      
      const sanitizedInput = sanitizeInput(input).toLowerCase();
      const matches = Object.keys(commands).filter(cmd => 
        cmd.startsWith(sanitizedInput) && isValidCommand(cmd)
      );
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
    }
  };

  const getSuggestions = () => {
    if (!input) return [];
    
    const sanitizedInput = sanitizeInput(input).toLowerCase();
    if (!isValidCommand(sanitizedInput)) return [];
    
    return Object.keys(commands)
      .filter(cmd => {
        
        return cmd.startsWith(sanitizedInput) && 
               cmd !== sanitizedInput && 
               isValidCommand(cmd);
      })
      .slice(0, 5);
  };

  const suggestions = getSuggestions();

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
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none text-[var(--terminal-text)] flex-1 w-full"
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
