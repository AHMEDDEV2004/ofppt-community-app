import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from 'react-native';

const REGISTRATION_COMPLETED_KEY = 'registration_completed';

export default function Index() {
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);

  useEffect(() => {
    checkRegistration();
  }, []);

  const checkRegistration = async () => {
    try {
      const registrationCompleted = await AsyncStorage.getItem(REGISTRATION_COMPLETED_KEY);
      setIsRegistered(!!registrationCompleted);
    } catch (error) {
      console.error('Error checking registration:', error);
      setIsRegistered(false);
    }
  };

  if (isRegistered === null) {
    return <View />; // Loading state
  }

  if (!isRegistered) {
    return <Redirect href="/register" />;
  }

  return <Redirect href="/(tabs)" />;
}
