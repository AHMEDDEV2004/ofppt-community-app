import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

export function SplashScreen() {
  const { isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(width)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          speed: 25,
          bounciness: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          speed: 25,
          bounciness: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#1a1a1a' : '#ffffff' }
    ]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ThemedText style={styles.welcomeText}>Welcome to</ThemedText>
      </Animated.View>
      
      <Animated.View style={[
        styles.titleContainer,
        {
          transform: [
            { translateX: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}>
        <ThemedText style={styles.title}>OFPPT</ThemedText>
        <ThemedText style={styles.subtitle}>Community</ThemedText>
      </Animated.View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ThemedText style={styles.tagline}>Where Learning Meets Innovation</ThemedText>
        <View style={styles.decorativeLine} />
        <ThemedText style={styles.description}>Connect • Learn • Grow</ThemedText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    marginVertical: 20,
  },
  welcomeText: {
    fontSize: 24,
    opacity: 0.8,
    marginBottom: 10,
  },
  titleContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 36,
    fontWeight: '500',
    color: '#0066cc',
    marginTop: -5,
  },
  tagline: {
    fontSize: 18,
    fontStyle: 'italic',
    marginTop: 10,
  },
  decorativeLine: {
    height: 3,
    width: 100,
    backgroundColor: '#0066cc',
    marginVertical: 15,
    borderRadius: 2,
  },
  description: {
    fontSize: 16,
    opacity: 0.7,
  },
});
