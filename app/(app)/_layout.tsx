import { Stack } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

export default function AppLayout() {
  const { isDark } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#000' : '#fff',
        },
        headerTintColor: isDark ? '#fff' : '#000',
        headerShadowVisible: false,
        headerBackTitle: 'Retour',
      }}
    >
      <Stack.Screen 
        name="edit-profile" 
        options={{ 
          title: 'Modifier le profil',
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="contact" 
        options={{ 
          title: 'Contact Us',
          headerShown: true,
          animation: 'slide_from_right'
        }} 
      />
      <Stack.Screen 
        name="about" 
        options={{ 
          title: 'À propos de nous',
          headerShown: true,
          animation: 'slide_from_right'
        }} 
      />
    </Stack>
  );
}
