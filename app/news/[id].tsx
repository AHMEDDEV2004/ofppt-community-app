import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Share,
  Platform,
  Dimensions,
  useColorScheme
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function NewsDetailScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const router = useRouter();
  const params = useLocalSearchParams();
  const { title, description, type, image, createdAt } = params;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString as string);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const shareNews = async () => {
    try {
      await Share.share({
        message: `${title}\n\n${description}\n\nShared from OFPPT Community App`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={isDarkMode ? '#fff' : '#000'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={shareNews}
        >
          <MaterialIcons
            name="share"
            size={24}
            color={isDarkMode ? '#fff' : '#000'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <Image
          source={{ uri: image as string }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.content}>
          <View style={styles.typeContainer}>
            <Text style={[
              styles.type,
              { backgroundColor: type === 'Course' ? '#4CAF50' : type === 'Event' ? '#2196F3' : '#FF9800' }
            ]}>
              {type}
            </Text>
            <Text style={[styles.date, isDarkMode && styles.darkText]}>
              {formatDate(createdAt as string)}
            </Text>
          </View>
          <Text style={[styles.title, isDarkMode && styles.darkText]}>
            {title}
          </Text>
          <Text style={[styles.description, isDarkMode && styles.darkText]}>
            {description}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  image: {
    width: Dimensions.get('window').width,
    height: 250,
  },
  content: {
    padding: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  type: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  darkText: {
    color: '#fff',
  },
});
