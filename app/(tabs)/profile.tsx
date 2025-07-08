import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  Modal, 
  TextInput,
  Dimensions,
  ImageBackground,
  Platform,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { ProfileService } from '@/services/ProfileService';
import { User } from '@/types/user';
import { Colors } from '@/constants/Colors';
import { Picker } from '@react-native-picker/picker';
import { db } from '@/config/firebase';
import { collection as firestoreCollection, getDocs as firestoreGetDocs } from 'firebase/firestore';
import { NIVEAUX, ANNEES } from '@/constants/FormationData';

const { width } = Dimensions.get('window');

interface DataItem {
  id: string;
  label: string;
  code?: string;
  niveau?: string;
}

export default function ProfileScreen() {
  const { isDark, toggleTheme } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Edit Profile States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [filiere, setFiliere] = useState('');
  const [niveau, setNiveau] = useState('');
  const [annee, setAnnee] = useState('');
  const [option, setOption] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [filieres, setFilieres] = useState<DataItem[]>([]);
  const [filteredFilieres, setFilteredFilieres] = useState<DataItem[]>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const userProfile = await ProfileService.getCurrentProfile();
      setProfile(userProfile);
      if (userProfile) {
        setProfileFields(userProfile);
        await loadFilieres();
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const setProfileFields = (userProfile: User) => {
    setFirstName(userProfile.firstName || '');
    setLastName(userProfile.lastName || '');
    setFiliere(userProfile.filiere || '');
    setNiveau(userProfile.niveau || '');
    setAnnee(userProfile.annee || '');
    setOption(userProfile.option || '');
  };

  const loadFilieres = async () => {
    try {
      const filieresSnapshot = await firestoreGetDocs(firestoreCollection(db, 'filieres'));
      const filieresData = filieresSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DataItem[];
      setFilieres(filieresData);
      if (niveau) {
        const filtered = filterFilieresByNiveau(niveau, filieresData);
        setFilteredFilieres(filtered);
      }
    } catch (error) {
      console.error('Error loading filieres:', error);
      Alert.alert('Error', 'Failed to load filières');
    }
  };

  const filterFilieresByNiveau = (selectedNiveau: string, filieresData: DataItem[]) => {
    const niveauItem = NIVEAUX.find(n => n.id === selectedNiveau);
    if (niveauItem) {
      return filieresData.filter(filiere => 
        filiere.niveau === niveauItem.code ||
        filiere.niveau === niveauItem.id
      );
    }
    return [];
  };

  useEffect(() => {
    if (niveau && filieres.length > 0) {
      const filtered = filterFilieresByNiveau(niveau, filieres);
      setFilteredFilieres(filtered);
      setFiliere(''); // Reset filiere when niveau changes
    } else {
      setFilteredFilieres([]);
    }
  }, [niveau, filieres]);

  useEffect(() => {
    // Show options dropdown only for 2ème année
    const shouldShowOptions = annee === '2';
    setShowOptions(shouldShowOptions);
    
    // Reset option when année changes
    if (!shouldShowOptions) {
      setOption('');
    }

    // Load options from selected filière if in 2ème année
    if (shouldShowOptions && filiere) {
      loadOptions();
    }
  }, [annee, filiere]);

  const loadOptions = async () => {
    try {
      // Find the selected filière document
      const selectedFiliere = filteredFilieres.find(f => f.label === filiere);
      if (!selectedFiliere) return;

      // Get the options subcollection from the filière document
      const optionsSnapshot = await firestoreGetDocs(
        firestoreCollection(db, 'filieres', selectedFiliere.id, 'options')
      );
      
      // Map the options documents to an array of option values
      const optionsData = optionsSnapshot.docs.map(doc => doc.data().value);
      setOptions(optionsData);
    } catch (error) {
      console.error('Error loading options:', error);
      Alert.alert('Error', 'Failed to load options');
    }
  };

  const handleSave = async () => {
    if (!firstName || !lastName || !filiere || !niveau || !annee) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);

      if (!profile) {
        Alert.alert('Error', 'No profile found');
        return;
      }

      const updatedProfile = {
        ...profile,
        firstName,
        lastName,
        filiere,
        niveau,
        annee,
        option: option || null,
        updatedAt: new Date().toISOString()
      };

      await ProfileService.updateProfile(updatedProfile);
      await loadProfile();
      setModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
        <View style={styles.loadingView}>
          <ActivityIndicator size="large" color={Colors[colorScheme].text} />
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
        <ThemedText>No profile found. Please register first.</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBackground}>
          <LinearGradient
            colors={isDark ? 
              ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)'] : 
              ['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.9)']}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatarInner}>
                  <ThemedText style={styles.avatarText}>
                    {profile.firstName?.[0]?.toUpperCase()}{profile.lastName?.[0]?.toUpperCase()}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={styles.name}>{profile.firstName} {profile.lastName}</ThemedText>
              <View style={styles.badgeContainer}>
                <LinearGradient
                  colors={isDark ? ['#2d3748', '#1a202c'] : ['#e2e8f0', '#cbd5e0']}
                  style={styles.badge}
                >
                  <MaterialCommunityIcons 
                    name="school" 
                    size={16} 
                    color={isDark ? '#fff' : '#000'} 
                  />
                  <ThemedText style={styles.badgeText}>{profile.niveau}</ThemedText>
                </LinearGradient>
                <LinearGradient
                  colors={isDark ? ['#2d3748', '#1a202c'] : ['#e2e8f0', '#cbd5e0']}
                  style={styles.badge}
                >
                  <FontAwesome5 
                    name="book-reader" 
                    size={14} 
                    color={isDark ? '#fff' : '#000'} 
                  />
                  <ThemedText style={styles.badgeText}>{profile.filiere}</ThemedText>
                </LinearGradient>
                <LinearGradient
                  colors={isDark ? ['#2d3748', '#1a202c'] : ['#e2e8f0', '#cbd5e0']}
                  style={styles.badge}
                >
                  <MaterialIcons 
                    name="calendar-today" 
                    size={14} 
                    color={isDark ? '#fff' : '#000'} 
                  />
                  <ThemedText style={styles.badgeText}>Année {profile.annee}</ThemedText>
                </LinearGradient>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons 
                name="person" 
                size={24} 
                color={Colors[colorScheme].text} 
              />
              <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>
            </View>
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: Colors[colorScheme].tint }]}
              onPress={() => setModalVisible(true)}
            >
              <MaterialIcons name="edit" size={20} color="#fff" />
              <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerContent}>
              <TouchableOpacity 
                style={[styles.floatingCard, styles.mainCard]}
                activeOpacity={0.9}
                onPress={() => router.push('/(app)/about')}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#6D28D9']}
                  style={styles.gradientCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.cardIcon}>
                    <MaterialIcons name="info" size={32} color="#fff" />
                  </View>
                  <ThemedText style={styles.cardTitle}>About Us</ThemedText>
                  <ThemedText style={styles.cardSubtitle}>Learn more about our app</ThemedText>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.actionCards}>
                <TouchableOpacity 
                  style={[styles.floatingCard, styles.actionCard]}
                  activeOpacity={0.9}
                  onPress={() => router.push('/(app)/contact')}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.gradientCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.actionCardContent}>
                      <MaterialIcons name="mail" size={28} color="#fff" />
                      <ThemedText style={styles.actionCardText}>Contact</ThemedText>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.floatingCard, styles.actionCard]}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#EF4444', '#DC2626']}
                    style={styles.gradientCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.actionCardContent}>
                      <MaterialIcons name="logout" size={28} color="#fff" />
                      <ThemedText style={styles.actionCardText}>Logout</ThemedText>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.floatingCard, styles.actionCard]}
                  onPress={toggleTheme}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={isDark ? ['#FCD34D', '#F59E0B'] : ['#3B82F6', '#1D4ED8']}
                    style={styles.gradientCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.actionCardContent}>
                      <MaterialIcons 
                        name={isDark ? 'wb-sunny' : 'dark-mode'} 
                        size={28} 
                        color="#fff" 
                      />
                      <ThemedText style={styles.actionCardText}>
                        {isDark ? 'Light' : 'Dark'}
                      </ThemedText>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: Colors[colorScheme].background }]}>
            <ScrollView style={styles.modalScroll}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Edit Profile</ThemedText>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={Colors[colorScheme].text} />
                </TouchableOpacity>
              </View>

              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.label}>Prénom</ThemedText>
                  <TextInput
                    style={[styles.input, { 
                      color: Colors[colorScheme].text, 
                      borderColor: isDark ? '#333' : '#ddd' 
                    }]}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Enter your first name"
                    placeholderTextColor={isDark ? '#666' : '#999'}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <ThemedText style={styles.label}>Nom</ThemedText>
                  <TextInput
                    style={[styles.input, { 
                      color: Colors[colorScheme].text, 
                      borderColor: isDark ? '#333' : '#ddd' 
                    }]}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Enter your last name"
                    placeholderTextColor={isDark ? '#666' : '#999'}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <ThemedText style={styles.label}>Niveau</ThemedText>
                  <View style={[styles.pickerContainer, { borderColor: isDark ? '#333' : '#ddd' }]}>
                    <Picker
                      selectedValue={niveau}
                      onValueChange={(itemValue) => setNiveau(itemValue)}
                      style={[styles.picker, { color: Colors[colorScheme].text }]}
                    >
                      <Picker.Item label="Select Niveau" value="" />
                      {NIVEAUX.map((n) => (
                        <Picker.Item key={n.id} label={n.label} value={n.id} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <ThemedText style={styles.label}>Filière</ThemedText>
                  <View style={[styles.pickerContainer, { borderColor: isDark ? '#333' : '#ddd' }]}>
                    <Picker
                      selectedValue={filiere}
                      onValueChange={(itemValue) => setFiliere(itemValue)}
                      style={[styles.picker, { color: Colors[colorScheme].text }]}
                      enabled={filteredFilieres.length > 0}
                    >
                      <Picker.Item label="Select Filière" value="" />
                      {filteredFilieres.map((f) => (
                        <Picker.Item key={f.id} label={f.label} value={f.label} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <ThemedText style={styles.label}>Année</ThemedText>
                  <View style={[styles.pickerContainer, { borderColor: isDark ? '#333' : '#ddd' }]}>
                    <Picker
                      selectedValue={annee}
                      onValueChange={(itemValue) => setAnnee(itemValue)}
                      style={[styles.picker, { color: Colors[colorScheme].text }]}
                    >
                      <Picker.Item label="Select Année" value="" />
                      {ANNEES.map((a) => (
                        <Picker.Item key={a.id} label={a.label} value={a.value} />
                      ))}
                    </Picker>
                  </View>
                </View>

                {showOptions && (
                  <View style={styles.inputContainer}>
                    <ThemedText style={styles.label}>Option</ThemedText>
                    <View style={[styles.pickerContainer, { borderColor: isDark ? '#333' : '#ddd' }]}>
                      <Picker
                        selectedValue={option}
                        onValueChange={(itemValue) => setOption(itemValue)}
                        style={[styles.picker, { color: Colors[colorScheme].text }]}
                        enabled={options.length > 0}
                      >
                        <Picker.Item label="Select Option" value="" />
                        {options.map((opt, index) => (
                          <Picker.Item key={index} label={opt} value={opt} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                )}
                
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: Colors[colorScheme].tint }]}
                  onPress={handleSave}
                >
                  <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerBackground: {
    width: '100%',
    height: 300,
    backgroundColor: Colors.light.tint + '20', // Light background color when no image
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.tint,
    padding: 3,
    marginBottom: 16,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 47,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    gap: 6,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  footerContent: {
    gap: 16,
  },
  floatingCard: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  mainCard: {
    height: 160,
    marginBottom: 16,
  },
  actionCard: {
    flex: 1,
    minWidth: width / 3 - 24,
    aspectRatio: 1,
  },
  gradientCard: {
    flex: 1,
    padding: 20,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  actionCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  footerButton: {
    flex: 1,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  themeButton: {
    backgroundColor: Colors.light.tint,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
  },
  aboutButton: {
    backgroundColor: '#8B5CF6',
  },
  contactButton: {
    backgroundColor: '#10B981',
  },
  buttonGradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  aboutButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '90%',
  },
  modalScroll: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  form: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
