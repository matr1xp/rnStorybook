export const colors = {
  primary: '#1EA7FD',
  primaryText: '#FFFFFF',
  secondary: '#F2F4F7',
  secondaryText: '#333333',
  danger: '#E5484D',
  text: '#1A1A1A',
  muted: '#6B7280',
  border: '#D0D5DD',
  surface: '#FFFFFF',
  background: '#FAFAFA',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 20, fontWeight: '700' },
  body: { fontSize: 16, fontWeight: '400' },
  label: { fontSize: 14, fontWeight: '600' },
  caption: { fontSize: 12, fontWeight: '400' },
} as const;
