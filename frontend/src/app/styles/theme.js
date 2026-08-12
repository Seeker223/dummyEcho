const shared = {
  radii: {
    sm: '10px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  shadow: {
    soft: '0 14px 30px rgba(15, 31, 68, 0.16)',
    elevated: '0 20px 48px rgba(15, 31, 68, 0.18)',
  },
}

export const lightTheme = {
  ...shared,
  mode: 'light',
  colors: {
    bgStart: '#fafbfc',
    bgEnd: '#f3f4f7',
    surface: '#ffffff',
    surfaceAlt: '#f8fafc',
    text: '#1a1f2e',
    muted: '#6b7280',
    border: '#e5e7eb',
    primary: '#dc2626',
    primaryDeep: '#7f1d1d',
    accent: '#fce4e4',
    success: '#16a34a',
    glowRed: 'rgba(220, 38, 38, 0.2)',
    glowBlue: 'rgba(37, 99, 235, 0.18)',
  },
}

export const darkTheme = {
  ...shared,
  mode: 'dark',
  colors: {
    bgStart: '#09111f',
    bgEnd: '#0f172a',
    surface: '#111827',
    surfaceAlt: '#0f1419',
    text: '#f1f5f9',
    muted: '#9ca3af',
    border: '#273549',
    primary: '#ef4444',
    primaryDeep: '#5a1616',
    accent: '#472222',
    success: '#22c55e',
    glowRed: 'rgba(239, 68, 68, 0.24)',
    glowBlue: 'rgba(59, 130, 246, 0.2)',
  },
}
