export interface UserProfile {
  firstName: string;
  lastName: string;
  fullName: string;
  filiere: string;
  filiereLabel?: string;
  niveau: string;
  niveauLabel?: string;
  annee: string;
  anneeLabel?: string;
  option: string;
  optionLabel?: string;
  bio: string;
  uid?: string;
  email?: string;
  branch?: string;  // Added for backward compatibility
  level?: string;   // Added for backward compatibility
  stats?: {
    posts?: number;
    followers?: number;
    following?: number;
  };
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  filiere: string;
  niveau: string;
  annee: string;
  option?: string | null;
  createdAt: string;
  updatedAt: string;
}
