import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  RefreshControl,
  TextInput,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ref, onValue, off } from 'firebase/database';
import { database } from '@/config/firebase';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { ThemedText } from '@/components/ThemedText';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  image: string;
  type: 'Course' | 'Event' | 'News'| 'Clubs' ;
  createdAt: string;
}

type NewsType = 'Course' | 'Event' | 'News' | 'Clubs' | 'All';

export default function NewsScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<NewsType>('All');

  const loadNews = () => {
    const newsRef = ref(database, 'news');
    
    onValue(newsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          // Convert object to array and sort by date
          const newsArray = Object.entries(data).map(([id, news]: [string, any]) => ({
            id,
            ...news
          }));
          newsArray.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setNewsItems(newsArray);
        } else {
          setNewsItems([]);
        }
        setError(null);
      } catch (err) {
        setError('Failed to load news. Please try again later.');
        console.error('Error loading news:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, (error) => {
      setError('Failed to load news. Please try again later.');
      console.error('Error loading news:', error);
      setLoading(false);
      setRefreshing(false);
    });
  };

  useEffect(() => {
    loadNews();
    return () => {
      // Cleanup subscription on unmount
      const newsRef = ref(database, 'news');
      off(newsRef);
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadNews();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Course':
        return '#22c55e';  // Bright green
      case 'Event':
        return '#3b82f6';  // Bright blue
      case 'News':
        return '#f97316';  // Bright orange
      case 'Clubs':
        return '#ec4899';  // Pink
      default:
        return '#666';
    }
  };

  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateDescription = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const filteredNews = useMemo(() => {
    return newsItems
      .filter(item => {
        const matchesType = selectedType === 'All' || item.type === selectedType;
        const matchesSearch = searchQuery === '' || 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [newsItems, selectedType, searchQuery]);

  const handleNewsPress = (item: NewsItem) => {
    router.push({
      pathname: '/news/[id]',
      params: {
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type,
        image: item.image,
        createdAt: item.createdAt,
      },
    });
  };

  const FilterButton = ({ type }: { type: NewsType }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedType === type && styles.filterButton,
        { backgroundColor: isDark ? '#1c1c1e' : '#f0f0f0' },
        selectedType === type && { backgroundColor: isDark ? '#2c2c2e' : '#e0e7ff' }
      ]}
      onPress={() => setSelectedType(type)}
    >
      <ThemedText style={[
        styles.filterButtonText,
        selectedType === type && { color: isDark ? '#fff' : '#6366f1' }
      ]}>
        {type}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#f5f5f5' }]}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Latest News</ThemedText>
        
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: isDark ? '#1c1c1e' : '#fff' }]}>
          <MaterialIcons 
            name="search" 
            size={20} 
            color={isDark ? '#666' : '#999'}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: isDark ? '#fff' : '#000' }]}
            placeholder="Search news..."
            placeholderTextColor={isDark ? '#666' : '#999'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons 
                name="close" 
                size={20} 
                color={isDark ? '#666' : '#999'}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Buttons */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterContainer}
        >
          {['All', 'Course', 'Event', 'News', 'Clubs'].map((type) => (
            <FilterButton key={type} type={type as NewsType} />
          ))}
        </ScrollView>
      </View>

      {/* News List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#fff' : '#000'}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: isDark ? '#2c2c2e' : '#6366f1' }]} 
              onPress={loadNews}
            >
              <ThemedText style={{ color: '#fff' }}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        ) : filteredNews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              {searchQuery ? 'No results found' : 'No news available'}
            </ThemedText>
          </View>
        ) : (
          filteredNews.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.newsCard, { backgroundColor: isDark ? '#1c1c1e' : '#fff' }]}
              onPress={() => handleNewsPress(item)}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: item.image }}
                style={styles.newsImage}
              />
              <View style={styles.newsContent}>
                <ThemedText style={styles.newsTitle} numberOfLines={2}>
                  {item.title}
                </ThemedText>
                <ThemedText 
                  style={[styles.newsDescription, { color: isDark ? '#999' : '#666' }]} 
                  numberOfLines={3}
                >
                  {truncateDescription(item.description)}
                </ThemedText>
                <View style={styles.newsFooter}>
                  <View style={styles.timeContainer}>
                    <MaterialIcons 
                      name="access-time" 
                      size={16} 
                      color={isDark ? '#666' : '#999'}
                    />
                    <ThemedText style={[styles.timeText, { color: isDark ? '#666' : '#999' }]}>
                      {formatDate(item.createdAt)}
                    </ThemedText>
                  </View>
                  <View style={[
                    styles.typeTag,
                    { backgroundColor: `${getTypeColor(item.type)}20` }  // Adding 20 for opacity
                  ]}>
                    <ThemedText style={[styles.typeText, { color: getTypeColor(item.type) }]}>
                      {item.type}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
  },
  newsCard: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  newsImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  newsContent: {
    padding: 16,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  newsDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 4,
    fontSize: 12,
  },
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
