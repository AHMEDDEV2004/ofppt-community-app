const { initializeApp, getApps, getApp } = require('firebase/app');
const { getFirestore, collection, addDoc, setDoc, doc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD6rmNDyXR3uYKawNfBGUhsdSNE22xnbh8",
  authDomain: "news-86407.firebaseapp.com",
  databaseURL: "https://news-86407.firebaseio.com",
  projectId: "news-86407",
  storageBucket: "news-86407.appspot.com",
  messagingSenderId: "75789875754",
  appId: "1:75789875754:android:af74fca48650fdc7bf6153"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);

// Test data for collections
const filieresData = [
  // Technicien Spécialisé (TS)
  { 
    id: 'digital_dev',
    label: 'Développement Digital', 
    value: 'digital_dev', 
    niveau: 'ts',
    options: [
      { label: 'Développement Mobile', value: 'mobile' },
      { label: 'Développement Web', value: 'web' },
      { label: 'Full Stack Development', value: 'fullstack' },
    ]
  },
  { 
    id: 'infra_digital',
    label: 'Infrastructure Digitale', 
    value: 'infra_digital', 
    niveau: 'ts',
    options: [
      { label: 'Cloud Computing', value: 'cloud' },
      { label: 'Cybersécurité', value: 'security' },
      { label: 'Administration Réseau', value: 'network' },
    ]
  },
  { 
    id: 'gestion',
    label: 'Gestion des Entreprises', 
    value: 'gestion', 
    niveau: 'ts',
    options: [
      { label: 'Finance et Comptabilité', value: 'finance' },
      { label: 'Commerce et Marketing', value: 'marketing' },
      { label: 'Gestion des Ressources Humaines', value: 'rh' },
    ]
  },
  { 
    id: 'mecanique',
    label: 'Génie Mécanique et Productique', 
    value: 'mecanique', 
    niveau: 'ts',
    options: [
      { label: 'Fabrication Mécanique', value: 'fabrication' },
      { label: 'Maintenance Industrielle', value: 'maintenance' },
      { label: 'Conception Mécanique', value: 'conception' },
    ]
  },
  
  // Technicien (T)
  { 
    id: 'info',
    label: 'Développement Informatique', 
    value: 'info', 
    niveau: 't',
    options: [
      { label: 'Programmation', value: 'prog' },
      { label: 'Base de données', value: 'db' },
    ]
  },
  { 
    id: 'infographie',
    label: 'Infographie', 
    value: 'infographie', 
    niveau: 't',
    options: [
      { label: 'Design Graphique', value: 'design' },
      { label: 'Motion Design', value: 'motion' },
    ]
  },
  { 
    id: 'comptabilite',
    label: 'Comptabilité', 
    value: 'comptabilite', 
    niveau: 't',
    options: [
      { label: 'Comptabilité Générale', value: 'general' },
      { label: 'Gestion Financière', value: 'finance' },
    ]
  },
  
  // Qualification (Q)
  { 
    id: 'electromecanique',
    label: 'Électromécanique', 
    value: 'electromecanique', 
    niveau: 'q',
    options: [
      { label: 'Maintenance Électrique', value: 'elec' },
      { label: 'Maintenance Mécanique', value: 'mec' },
    ]
  },
  { 
    id: 'menuiserie',
    label: 'Menuiserie', 
    value: 'menuiserie', 
    niveau: 'q',
    options: [
      { label: 'Menuiserie Bois', value: 'bois' },
      { label: 'Menuiserie Aluminium', value: 'alu' },
    ]
  }
];

const niveauxData = [
  { label: 'Technicien Spécialisé', value: 'ts', code: 'TS' },
  { label: 'Technicien', value: 't', code: 'T' },
  { label: 'Qualification', value: 'q', code: 'Q' },
];

const anneesData = [
  { label: '1ère année', value: '1' },
  { label: '2ème année', value: '2' },
];

// Function to populate collections
async function populateCollections() {
  try {
    console.log('Starting to populate collections...');

    // Populate filieres and their options
    console.log('Adding filieres and their options...');
    for (const filiere of filieresData) {
      const filiereRef = doc(db, 'filieres', filiere.value);
      const filiereData = {
        label: filiere.label,
        value: filiere.value,
        niveau: filiere.niveau
      };
      await setDoc(filiereRef, filiereData);

      // If filiere has options, create a subcollection
      if (filiere.options) {
        const optionsCollectionRef = collection(filiereRef, 'options');
        for (const option of filiere.options) {
          await addDoc(optionsCollectionRef, option);
        }
      }
    }
    console.log('Filieres and options added successfully');

    // Populate niveaux
    console.log('Adding niveaux...');
    const niveauxRef = collection(db, 'niveaux');
    for (const niveau of niveauxData) {
      await addDoc(niveauxRef, niveau);
    }
    console.log('Niveaux added successfully');

    // Populate annees
    console.log('Adding annees...');
    const anneesRef = collection(db, 'annees');
    for (const annee of anneesData) {
      await addDoc(anneesRef, annee);
    }
    console.log('Annees added successfully');

    console.log('All collections populated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating collections:', error);
    process.exit(1);
  }
}

// Run the population script
populateCollections();
