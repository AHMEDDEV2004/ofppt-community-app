import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { generateAIResponse, getChatHistory, clearChatHistory, deleteMessage, ChatMessage } from '@/services/ChatService';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import { ThemedText } from '@/components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInUp, 
  FadeOutDown,
  SlideInRight,
  Layout,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function AIScreen() {
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(getChatHistory());
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    setMessage('');
    setLoading(true);
    inputRef.current?.blur();

    try {
      const response = await generateAIResponse(userMessage);
      setMessages(getChatHistory());
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to generate AI response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearChatHistory();
      setMessages(getChatHistory());
    } catch (error) {
      console.error('Error clearing chat history:', error);
      Alert.alert('Error', 'Failed to clear chat history. Please try again.');
    }
  };

  const handleDeleteMessage = async (timestamp: number) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMessage(timestamp);
              setMessages(getChatHistory());
            } catch (error) {
              console.error('Error deleting message:', error);
              Alert.alert('Error', 'Failed to delete message. Please try again.');
            }
          },
        },
      ],
    );
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}
    >
      <View style={[styles.header, { backgroundColor: isDark ? '#1c1c1e' : '#fff' }]}>
        <View style={styles.headerContent}>
          <LinearGradient
            colors={['#4f46e5', '#4338ca']}
            style={styles.avatar}
          >
            <ThemedText style={[styles.avatarText, { color: '#fff' }]}>AI</ThemedText>
          </LinearGradient>
          <View style={styles.headerTextContainer}>
            <ThemedText style={styles.title}>OFPPT Assistant</ThemedText>
            <ThemedText style={styles.subtitle}>Ask me anything about OFPPT</ThemedText>
          </View>
          <TouchableOpacity 
            onPress={handleClearHistory}
            style={styles.clearButton}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name="delete-outline" 
              size={24} 
              color={isDark ? '#666' : '#999'} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((msg, index) => (
          <Animated.View
            key={msg.timestamp}
            entering={SlideInRight.delay(index * 100)}
            layout={Layout.springify()}
            style={[
              styles.messageContainer,
              msg.role === 'user' ? styles.userMessage : styles.aiMessage,
              { 
                backgroundColor: isDark 
                  ? (msg.role === 'user' ? '#4f46e5' : '#1c1c1e') 
                  : (msg.role === 'user' ? '#6366f1' : '#f5f5f5'),
              }
            ]}
          >
            {msg.role === 'assistant' && (
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#4f46e5', '#4338ca']}
                  style={styles.avatar}
                >
                  <ThemedText style={[styles.avatarText, { color: '#fff' }]}>AI</ThemedText>
                </LinearGradient>
              </View>
            )}
            <View style={[
              styles.messageContent,
              msg.role === 'user' ? styles.userMessageContent : styles.aiMessageContent
            ]}>
              <ThemedText style={[
                styles.messageText,
                { color: msg.role === 'user' ? '#fff' : (isDark ? '#fff' : '#000') }
              ]}>
                {msg.content}
              </ThemedText>
              <View style={[
                styles.messageFooter,
                msg.role === 'user' ? styles.userFooter : styles.aiFooter
              ]}>
                <ThemedText style={[
                  styles.timestamp, 
                  { color: msg.role === 'user' ? '#fff' : (isDark ? '#999' : '#666') }
                ]}>
                  {formatTimestamp(msg.timestamp)}
                </ThemedText>
                <TouchableOpacity
                  onPress={() => handleDeleteMessage(msg.timestamp)}
                  style={styles.deleteButton}
                  activeOpacity={0.7}
                >

                </TouchableOpacity>
              </View>
            </View>
            {msg.role === 'user' && (
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={isDark ? ['#2d3748', '#1a202c'] : ['#e2e8f0', '#cbd5e0']}
                  style={styles.avatar}
                >
                  <ThemedText style={styles.avatarText}>U</ThemedText>
                </LinearGradient>
              </View>
            )}
          </Animated.View>
        ))}
        {loading && (
          <Animated.View 
            entering={FadeInUp}
            exiting={FadeOutDown}
            style={[
              styles.loadingContainer, 
              { 
                backgroundColor: isDark ? '#1c1c1e' : '#f5f5f5',
                marginLeft: 50
              }
            ]}
          >
            <LinearGradient
              colors={['#4f46e5', '#4338ca']}
              style={styles.avatar}
            >
              <ThemedText style={[styles.avatarText, { color: '#fff' }]}>AI</ThemedText>
            </LinearGradient>
            <View style={styles.loadingContent}>
              <ActivityIndicator color={isDark ? '#fff' : Colors.light.tint} />
              <ThemedText style={styles.loadingText}>AI is thinking...</ThemedText>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <LinearGradient
        colors={isDark ? ['#1c1c1e', '#000'] : ['#fff', '#f8fafc']}
        style={styles.inputContainer}
      >
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            { 
              backgroundColor: isDark ? '#2c2c2e' : '#f5f5f5',
              color: isDark ? '#fff' : '#000',
              borderColor: isDark ? '#333' : '#e2e8f0',
            }
          ]}
          placeholder="Type your message..."
          placeholderTextColor={isDark ? '#666' : '#999'}
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { 
              backgroundColor: message.trim() 
                ? Colors[colorScheme].tint
                : (isDark ? '#333' : '#e2e8f0'),
              opacity: message.trim() ? 1 : 0.5
            }
          ]}
          onPress={handleSend}
          disabled={!message.trim() || loading}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={message.trim() ? '#fff' : (isDark ? '#666' : '#999')} 
          />
        </TouchableOpacity>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  clearButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
    paddingBottom: 30,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    marginHorizontal: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  messageContent: {
    flex: 1,
  },
  userMessageContent: {
    alignItems: 'flex-end',
  },
  aiMessageContent: {
    alignItems: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  userFooter: {
    justifyContent: 'flex-end',
  },
  aiFooter: {
    justifyContent: 'flex-start',
  },
  timestamp: {
    fontSize: 12,
    marginHorizontal: 8,
    opacity: 0.8,
  },
  deleteButton: {
    padding: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
