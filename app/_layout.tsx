import React, { useState, useEffect } from 'react';
import { Slot } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SplashScreen as CustomSplashScreen } from '@/components/SplashScreen';
import { ThemeProvider } from '@/context/ThemeContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';

const REGISTRATION_COMPLETED_KEY = 'registration_completed';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const registrationCompleted = await AsyncStorage.getItem(REGISTRATION_COMPLETED_KEY);
        
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setShowSplash(false);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing app:', error);
        setShowSplash(false);
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  return (
    <ThemeProvider>
      {showSplash || isLoading || !loaded ? (
        <CustomSplashScreen />
      ) : (
        <Slot />
      )}
    </ThemeProvider>
  );
}
