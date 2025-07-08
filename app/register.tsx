import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, Platform, ActivityIndicator, Text } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { db } from '@/config/firebase';
import { collection as firestoreCollection, getDocs as firestoreGetDocs } from 'firebase/firestore';
import { ProfileService } from '@/services/ProfileService';
import { NIVEAUX, ANNEES } from '@/constants/FormationData';

interface DataItem {
  id: string;
  label: string;
  code?: string;
  niveau?: string;
}

export default function RegisterScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [filiere, setFiliere] = useState('');
  const [niveau, setNiveau] = useState('');
  const [annee, setAnnee] = useState('');
  const [option, setOption] = useState('');

  const [filieres, setFilieres] = useState<DataItem[]>([]);
  const [filteredFilieres, setFilteredFilieres] = useState<DataItem[]>([]);

  useEffect(() => {
    const checkExistingProfile = async () => {
      try {
        const profile = await ProfileService.getProfile();
        if (profile) {
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Error checking profile:', error);
      }
    };

    checkExistingProfile();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch filieres
        const filieresSnapshot = await firestoreGetDocs(firestoreCollection(db, 'filieres'));
        const filieresData = filieresSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data
          };
        }) as DataItem[];
        setFilieres(filieresData);

      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error loading data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (niveau && filieres.length > 0) {
      const selectedNiveau = NIVEAUX.find(n => n.id === niveau);
      
      if (selectedNiveau) {
        const filtered = filieres.filter(filiere => {
          return (
            filiere.niveau === selectedNiveau.code ||
            filiere.niveau === selectedNiveau.id
          );
        });
        setFilteredFilieres(filtered);
      }
      setFiliere(''); // Reset filiere when niveau changes
    } else {
      setFilteredFilieres([]);
    }
  }, [niveau, filieres]);

  const handleRegister = async () => {
    if (!firstName || !lastName || !filiere || !niveau || !annee) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);

      // Create profile
      await ProfileService.createProfile({
        firstName,
        lastName,
        filiere,
        niveau,
        annee,
        option: option || null
      });

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error registering:', error);
      alert('Error creating profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].text} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Prénom</ThemedText>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#F7F8FA', color: Colors[colorScheme].text }
            ]}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Entrez votre prénom"
            placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
          />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Nom</ThemedText>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#F7F8FA', color: Colors[colorScheme].text }
            ]}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Entrez votre nom"
            placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
          />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Niveau de Formation</ThemedText>
          <View style={[styles.pickerContainer, { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#F7F8FA' }]}>
            <Picker
              selectedValue={niveau}
              onValueChange={(itemValue) => {
                setNiveau(itemValue);
                setFiliere('');
                setOption('');
              }}
              style={[styles.picker, { color: Colors[colorScheme].text }]}
            >
              <Picker.Item label="Sélectionner un niveau" value="" />
              {NIVEAUX.map((item) => (
                <Picker.Item key={item.id} label={item.label} value={item.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Filière</ThemedText>
          <View style={[styles.pickerContainer, { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#F7F8FA' }]}>
            <Picker
              selectedValue={filiere}
              onValueChange={(itemValue) => {
                setFiliere(itemValue);
                setOption('');
              }}
              style={[styles.picker, { color: Colors[colorScheme].text }]}
              enabled={!!niveau}
            >
              <Picker.Item label="Sélectionner une filière" value="" />
              {filteredFilieres.map((item) => (
                <Picker.Item key={item.id} label={item.label} value={item.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Année</ThemedText>
          <View style={[styles.pickerContainer, { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#F7F8FA' }]}>
            <Picker
              selectedValue={annee}
              onValueChange={(itemValue) => {
                setAnnee(itemValue);
                if (itemValue !== '2') {
                  setOption('');
                }
              }}
              style={[styles.picker, { color: Colors[colorScheme].text }]}
            >
              <Picker.Item label="Sélectionner une année" value="" />
              {ANNEES.map((item) => (
                <Picker.Item key={item.id} label={item.label} value={item.id} />
              ))}
            </Picker>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, { opacity: isLoading ? 0.7 : 1 }]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>S'inscrire</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    opacity: 0.8,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  pickerContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#6366f1',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
