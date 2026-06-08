export interface Partenaire {
  id_partenaire: number;
  libelle: string;
  description: string | null;
  login: string;
  last_update: string | null;
  last_modification: string | null;
  est_actif: boolean;
}

export interface PartenaireCreate {
  libelle: string;
  description?: string;
  login: string;
  password: string;
  est_actif?: boolean;
}

export interface ServicePublic {
  id_service: number;
  nom_service: string;
  description: string | null;
  date_creation: string | null;
  est_actif: boolean | null;
  id_partenaire: number;
}

export interface ServiceCreate {
  nom_service: string;
  description?: string;
  date_creation?: string;
  est_actif?: boolean;
  id_partenaire: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
