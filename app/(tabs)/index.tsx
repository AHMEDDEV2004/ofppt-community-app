import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const colorScheme = useColorScheme();

  const features = [
    {
      icon: 'newspaper-outline',
      title: 'Latest News',
      description: 'Stay updated with the latest OFPPT news and announcements'
    },
    {
      icon: 'calendar-outline',
      title: 'Events',
      description: 'View upcoming events, workshops, and activities'
    },
    {
      icon: 'people-outline',
      title: 'Community',
      description: 'Connect with other students and share experiences'
    },
    {
      icon: 'book-outline',
      title: 'Resources',
      description: 'Access study materials and educational resources'
    }
  ];

  return (
    <ScrollView 
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background }
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.welcomeBox, { backgroundColor: Colors[colorScheme].tint }]}>
          <ThemedText style={styles.welcomeText}>Welcome to</ThemedText>
          <ThemedText style={styles.appName}>OFPPT Community</ThemedText>
          <ThemedText style={styles.tagline}>Your Student Hub</ThemedText>
        </View>
      </View>

      <View style={styles.content}>
        <ThemedText style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>
          Discover Features
        </ThemedText>

        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <TouchableOpacity 
              key={index}
              style={[
                styles.featureCard,
                { 
                  backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#F7F8FA',
                  borderColor: colorScheme === 'dark' ? '#333' : '#E1E3EA'
                }
              ]}
            >
              <View style={[styles.iconContainer, { backgroundColor: Colors[colorScheme].tint }]}>
                <Ionicons name={feature.icon} size={24} color="#fff" />
              </View>
              <ThemedText style={[styles.featureTitle, { color: Colors[colorScheme].text }]}>
                {feature.title}
              </ThemedText>
              <ThemedText style={[styles.featureDescription, { color: Colors[colorScheme].tabIconDefault }]}>
                {feature.description}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  welcomeBox: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  appName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  tagline: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
});
