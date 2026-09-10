const STATUS_COLOR_MAP = {
  green: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', dot: 'bg-green-400' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', dot: 'bg-orange-400' },
  red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', dot: 'bg-red-400' },
} as const;

export type ProjectStatusColor = keyof typeof STATUS_COLOR_MAP;

export function getStatusColorStyles(color?: string) {
  return STATUS_COLOR_MAP[color as ProjectStatusColor] || STATUS_COLOR_MAP.green;
}

export function getProjectHashId(id: string): string {
  return `0x${id.slice(0, 6).toUpperCase().padEnd(6, '0')}`;
}
