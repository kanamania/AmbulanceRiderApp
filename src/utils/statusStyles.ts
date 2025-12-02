export interface StatusStyle {
  background: string;
  color: string;
}

const normalize = (status: string): string => {
  const value = (status || '').toLowerCase();
  if (value === 'accepted' || value === 'approved') return 'approved';
  if (value === 'inprogress' || value === 'in_progress') return 'in_progress';
  if (value === 'rejected') return 'rejected';
  if (value === 'pending') return 'pending';
  if (value === 'completed') return 'completed';
  if (value === 'cancelled' || value === 'canceled') return 'cancelled';
  return value || 'default';
};

const STATUS_STYLE_MAP: Record<string, StatusStyle> = {
  pending: {
    background: '#FACC15',
    color: '#1F2937',
  },
  approved: {
    background: '#1D4ED8',
    color: '#FFFFFF',
  },
  in_progress: {
    background: '#0EA5E9',
    color: '#0F172A',
  },
  completed: {
    background: '#16A34A',
    color: '#FFFFFF',
  },
  cancelled: {
    background: '#DC2626',
    color: '#FFFFFF',
  },
  rejected: {
    background: '#6B7280',
    color: '#FFFFFF',
  },
  default: {
    background: '#6B7280',
    color: '#FFFFFF',
  },
};

export const getStatusStyle = (status: string): StatusStyle => {
  const key = normalize(status);
  return STATUS_STYLE_MAP[key] || STATUS_STYLE_MAP.default;
};

export const getNormalizedStatus = (status: string): string => normalize(status);
