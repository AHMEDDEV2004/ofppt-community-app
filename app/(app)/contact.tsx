import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Alert, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';

export default function ContactScreen() {
  const { isDark, toggleTheme } = useTheme();  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const contactMethods = [
    {
      icon: 'mail',
      title: 'Email',
      value: 'support@ofpptcommunity.com',
      action: () => Linking.openURL('mailto:support@ofpptcommunity.com')
    },
    {
      icon: 'phone',
      title: 'Phone',
      value: '+212 123-456789',
      action: () => Linking.openURL('tel:+212123456789')
    },
    {
      icon: 'location-on',
      title: 'Address',
      value: 'OFPPT Skhirat, Morocco',
      action: () => Linking.openURL('https://www.google.com/maps/place/Ofppt+Skhirat/@33.85156,-7.0292331,17z/data=!3m1!4b1!4m6!3m5!1s0xda709cb6ad375a3:0x9a7ba9633da4de3f!8m2!3d33.8515601!4d-7.0243622!16s%2Fg%2F11pykcj2p3?entry=ttu&g_ep=EgoyMDI0MTIxMS4wIKXMDSoASAFQAw%3D%3D')
    }
  ];

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    // Here you would typically send the message to your backend
    Alert.alert(
      'Success',
      'Thank you for your message. We will get back to you soon!',
      [{ text: 'OK', onPress: () => {
        setName('');
        setEmail('');
        setMessage('');
      }}]
    );
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false
        }}
      />
      <ScrollView 
        style={[styles.container, { backgroundColor: isDark ? '#000' : '#f5f5f5' }]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={isDark ? ['#1a1a1a', '#000'] : ['#fff', '#f5f5f5']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <MaterialIcons 
              name="contact-support" 
              size={64} 
              color={isDark ? '#fff' : '#000'} 
            />
            <ThemedText style={styles.title}>Contact Us</ThemedText>
            <ThemedText style={styles.subtitle}>
              We'd love to hear from you
            </ThemedText>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.contactMethods}>
            {contactMethods.map((method, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.contactCard,
                  { backgroundColor: isDark ? '#1c1c1e' : '#fff' }
                ]}
                onPress={method.action}
              >
                <MaterialIcons 
                  name={method.icon} 
                  size={24} 
                  color={isDark ? '#fff' : '#000'} 
                />
                <View style={styles.contactInfo}>
                  <ThemedText style={styles.contactTitle}>{method.title}</ThemedText>
                  <ThemedText style={styles.contactValue}>{method.value}</ThemedText>
                </View>
                <MaterialIcons 
                  name="arrow-forward-ios" 
                  size={16} 
                  color={isDark ? '#666' : '#999'} 
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.formSection}>
            <ThemedText style={styles.formTitle}>Send us a Message</ThemedText>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Name</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: isDark ? '#1c1c1e' : '#fff',
                    color: isDark ? '#fff' : '#000'
                  }
                ]}
                value={name}
                onChangeText={setName}
                placeholderTextColor={isDark ? '#666' : '#999'}
                placeholder="Your name"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: isDark ? '#1c1c1e' : '#fff',
                    color: isDark ? '#fff' : '#000'
                  }
                ]}
                value={email}
                onChangeText={setEmail}
                placeholderTextColor={isDark ? '#666' : '#999'}
                placeholder="Your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Message</ThemedText>
              <TextInput
                style={[
                  styles.messageInput,
                  { 
                    backgroundColor: isDark ? '#1c1c1e' : '#fff',
                    color: isDark ? '#fff' : '#000'
                  }
                ]}
                value={message}
                onChangeText={setMessage}
                placeholderTextColor={isDark ? '#666' : '#999'}
                placeholder="Your message"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <ThemedText style={styles.buttonText}>Send Message</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 20,
  },
  content: {
    padding: 20,
  },
  contactMethods: {
    gap: 16,
    marginBottom: 32,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactTitle: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  formSection: {
    gap: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    opacity: 0.8,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  messageInput: {
    height: 120,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gradientButton: {
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
