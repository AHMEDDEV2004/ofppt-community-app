import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '../../components/ThemedText';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function AboutScreen() {
  const { isDark } = useTheme();

  const features = [
    {
      icon: 'school',
      title: 'Formation',
      description: 'Accédez à des informations détaillées sur les formations OFPPT'
    },
    {
      icon: 'group',
      title: 'Communauté',
      description: 'Rejoignez une communauté active d\'étudiants et de professionnels'
    },
    {
      icon: 'event',
      title: 'Événements',
      description: 'Restez informé des derniers événements et activités'
    },
    {
      icon: 'lightbulb',
      title: 'Ressources',
      description: 'Accédez à des ressources pédagogiques et des outils d\'apprentissage'
    }
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: isDark ? '#000' : '#f5f5f5' }]}
      contentContainerStyle={styles.contentContainer}
    >
      <LinearGradient
        colors={isDark ? ['#1a1a1a', '#000'] : ['#fff', '#f5f5f5']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <MaterialIcons 
            name="info" 
            size={64} 
            color={isDark ? '#fff' : '#000'} 
          />
          <View style={styles.headerTextContainer}>
            <ThemedText style={styles.title}>À propos</ThemedText>
            <ThemedText style={styles.subtitle}>
              Découvrez OFPPT Community
            </ThemedText>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.featuresContainer}>
        <ThemedText style={styles.sectionTitle}>Fonctionnalités</ThemedText>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <View 
              key={index}
              style={[styles.featureCard, { backgroundColor: isDark ? '#1c1c1e' : '#fff' }]}
            >
              <MaterialIcons 
                name={feature.icon} 
                size={32} 
                color={isDark ? '#6366f1' : '#4f46e5'} 
              />
              <ThemedText style={styles.featureTitle}>{feature.title}</ThemedText>
              <ThemedText style={styles.featureDescription}>
                {feature.description}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.aboutSection}>
        <ThemedText style={styles.sectionTitle}>Notre Mission</ThemedText>
        <ThemedText style={styles.aboutText}>
          OFPPT Community est une plateforme dédiée aux étudiants et aux professionnels de l'OFPPT. 
          Notre mission est de faciliter l'accès à l'information, promouvoir l'échange et 
          l'entraide entre les membres de la communauté.
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    padding: Platform.OS === 'ios' ? 60 : 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 5,
  },
  featuresContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: 160,
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  aboutSection: {
    padding: 20,
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
});
