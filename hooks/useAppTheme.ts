import { useTheme } from '@/context/ThemeContext';

export function useAppTheme() {
  const { isDark } = useTheme();

  const theme = {
    colors: {
      background: isDark ? '#000' : '#fff',
      text: isDark ? '#fff' : '#000',
      primary: '#6366f1',
      secondary: '#3b82f6',
      card: isDark ? '#1c1c1e' : '#fff',
      border: isDark ? '#333' : '#eee',
      notification: '#ef4444',
      placeholder: isDark ? '#666' : '#999',
    },
    gradients: {
      primary: isDark ? ['#1a1a1a', '#000'] : ['#6366f1', '#3b82f6'],
    },
  };

  return { theme, isDark };
}
