export const NIVEAUX = [
  { id: 'T', label: 'Technicien', code: 'T' },
  { id: 'TS', label: 'Technicien Spécialisé', code: 'TS' },
  { id: 'Q', label: 'Qualification', code: 'Q' }
];

export const ANNEES = [
  { id: '1', label: '1ère année', value: '1' },
  { id: '2', label: '2ème année', value: '2' }
];

export interface FormationItem {
  id: string;
  label: string;
  code?: string;
  value?: string;
}
