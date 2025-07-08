import { db } from '@/config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/user';

const USER_ID_KEY = 'anonymous_user_id';

export const ProfileService = {
  async createProfile(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      // Generate a unique ID
      const userId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      
      // Create the user document
      const userDoc: User = {
        id: userId,
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', userId), userDoc);

      // Save ID to AsyncStorage
      await AsyncStorage.setItem(USER_ID_KEY, userId);

      return userDoc;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  },

  async getCurrentProfile(): Promise<User | null> {
    try {
      // Get user ID from AsyncStorage
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      if (!userId) {
        console.log('No user ID found in AsyncStorage');
        return null;
      }

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        console.log('No user document found in Firestore');
        return null;
      }

      const userData = userDoc.data() as User;
      console.log('Found user profile:', userData);
      return userData;
    } catch (error) {
      console.error('Error getting current profile:', error);
      throw error;
    }
  },

  async getProfile(): Promise<User | null> {
    try {
      // Get user ID from AsyncStorage
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      if (!userId) return null;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return null;

      return userDoc.data() as User;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  },

  async updateProfile(userData: User): Promise<void> {
    try {
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      if (!userId) throw new Error('No user ID found');

      const updatedData = {
        ...userData,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, 'users', userId), updatedData);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  async getUserId(): Promise<string | null> {
    return AsyncStorage.getItem(USER_ID_KEY);
  }
};
