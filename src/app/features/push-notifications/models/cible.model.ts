interface Cible {
  id_cible: number;
  type: 'etudiant' | 'personnel' | 'groupe';
  label?: string;
  numero?: string;
  matricule?: string;
  code?: string;
}
