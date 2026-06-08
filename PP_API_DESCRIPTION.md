# UCAD Public Services API — Description pour intégration Angular

## Base URL

```
http://localhost:8090/api/v1
```

Documentation interactive disponible sur :
- **Swagger UI** → `http://localhost:8090/docs`
- **ReDoc** → `http://localhost:8090/redoc`

---

## Modèles de données

### Partenaire
```typescript
interface Partenaire {
  id_partenaire: number;
  libelle: string;
  description: string | null;
  login: string;
  last_update: string | null;       // "YYYY-MM-DD"
  last_modification: string | null; // "YYYY-MM-DD"
  est_actif: boolean;
  // ⚠️ le champ password n'est JAMAIS retourné
}
```

### Service
```typescript
interface Service {
  id_service: number;
  nom_service: string;
  description: string | null;
  date_creation: string | null; // "YYYY-MM-DD"
  est_actif: boolean | null;
  id_partenaire: number;
}
```

### Réponse paginée (générique)
```typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
```

---

## Endpoints Partenaires — `/api/v1/partenaires`

### GET `/`
Liste paginée avec filtres.

**Query params :**
| Paramètre | Type | Description |
|---|---|---|
| `page` | `number` | Page courante (défaut: 1) |
| `size` | `number` | Éléments par page (défaut: 20, max: 100) |
| `libelle` | `string` | Filtre partiel sur le libellé (ILIKE) |
| `est_actif` | `boolean` | Filtrer par statut actif/inactif |

**Réponse 200 :** `PaginatedResponse<Partenaire>`

---

### GET `/{id}`
**Réponse 200 :** `Partenaire`
**Réponse 404 :** `{ "detail": "Partenaire X introuvable" }`

---

### POST `/`
Créer un partenaire.

**Body :**
```typescript
interface PartenaireCreate {
  libelle: string;          // requis, max 255 chars
  description?: string;
  login: string;            // requis
  password: string;         // requis, min 6 chars — haché côté serveur
  est_actif?: boolean;      // défaut: true
}
```
**Réponse 201 :** `Partenaire`
**Réponse 422 :** erreurs de validation Pydantic

---

### PUT `/{id}`
Mise à jour partielle (seuls les champs envoyés sont modifiés).

**Body :** tous les champs de `PartenaireCreate` sont optionnels.

**Réponse 200 :** `Partenaire` (avec `last_modification` mis à jour)

---

### DELETE `/{id}`
**Soft delete** — met `est_actif = false`, ne supprime pas l'enregistrement.

**Réponse 200 :** `Partenaire` (avec `est_actif: false`)

---

### PATCH `/{id}/activate`
Réactive un partenaire désactivé.

**Réponse 200 :** `Partenaire` (avec `est_actif: true`)

---

## Endpoints Services — `/api/v1/services`

### GET `/`
**Query params :**
| Paramètre | Type | Description |
|---|---|---|
| `page` | `number` | Page courante (défaut: 1) |
| `size` | `number` | Éléments par page (défaut: 20, max: 100) |
| `nom_service` | `string` | Filtre partiel sur le nom (ILIKE) |
| `est_actif` | `boolean` | Filtrer par statut |
| `id_partenaire` | `number` | Filtrer par partenaire |

**Réponse 200 :** `PaginatedResponse<Service>`

---

### GET `/partenaire/{id_partenaire}`
Tous les services d'un partenaire (liste simple, non paginée).

**Réponse 200 :** `Service[]`
**Réponse 404 :** si le partenaire n'existe pas

---

### GET `/{id}`
**Réponse 200 :** `Service`
**Réponse 404 :** `{ "detail": "Service X introuvable" }`

---

### POST `/`
**Body :**
```typescript
interface ServiceCreate {
  nom_service: string;      // requis, unique
  description?: string;
  date_creation?: string;   // "YYYY-MM-DD" — défaut: aujourd'hui
  est_actif?: boolean;      // défaut: true
  id_partenaire: number;    // requis — doit exister
}
```
**Réponse 201 :** `Service`
**Réponse 400 :** si `id_partenaire` n'existe pas
**Réponse 422 :** erreurs de validation

---

### PUT `/{id}`
Mise à jour partielle — tous les champs de `ServiceCreate` sont optionnels.

**Réponse 200 :** `Service`

---

### DELETE `/{id}`
**Soft delete** — met `est_actif = false`.

**Réponse 200 :** `Service` (avec `est_actif: false`)

---

### PATCH `/{id}/activate`
**Réponse 200 :** `Service` (avec `est_actif: true`)

---

## Squelette Angular — `api.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8000/api/v1';

export interface Partenaire {
  id_partenaire: number;
  libelle: string;
  description: string | null;
  login: string;
  last_update: string | null;
  last_modification: string | null;
  est_actif: boolean;
}

export interface Service {
  id_service: number;
  nom_service: string;
  description: string | null;
  date_creation: string | null;
  est_actif: boolean | null;
  id_partenaire: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

@Injectable({ providedIn: 'root' })
export class UcadApiService {
  constructor(private http: HttpClient) {}

  // ── Partenaires ──────────────────────────────────────────────

  getPartenaires(page = 1, size = 20, filters: {
    libelle?: string; est_actif?: boolean
  } = {}): Observable<PaginatedResponse<Partenaire>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (filters.libelle)                 params = params.set('libelle', filters.libelle);
    if (filters.est_actif !== undefined) params = params.set('est_actif', filters.est_actif);
    return this.http.get<PaginatedResponse<Partenaire>>(`${API}/partenaires/`, { params });
  }

  getPartenaire(id: number): Observable<Partenaire> {
    return this.http.get<Partenaire>(`${API}/partenaires/${id}`);
  }

  createPartenaire(body: Partial<Partenaire> & { password: string }): Observable<Partenaire> {
    return this.http.post<Partenaire>(`${API}/partenaires/`, body);
  }

  updatePartenaire(id: number, body: Partial<Partenaire>): Observable<Partenaire> {
    return this.http.put<Partenaire>(`${API}/partenaires/${id}`, body);
  }

  deletePartenaire(id: number): Observable<Partenaire> {
    return this.http.delete<Partenaire>(`${API}/partenaires/${id}`);
  }

  activatePartenaire(id: number): Observable<Partenaire> {
    return this.http.patch<Partenaire>(`${API}/partenaires/${id}/activate`, {});
  }

  // ── Services ─────────────────────────────────────────────────

  getServices(page = 1, size = 20, filters: {
    nom_service?: string; est_actif?: boolean; id_partenaire?: number
  } = {}): Observable<PaginatedResponse<Service>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (filters.nom_service)             params = params.set('nom_service', filters.nom_service);
    if (filters.est_actif !== undefined) params = params.set('est_actif', filters.est_actif);
    if (filters.id_partenaire)           params = params.set('id_partenaire', filters.id_partenaire);
    return this.http.get<PaginatedResponse<Service>>(`${API}/services/`, { params });
  }

  getServicesByPartenaire(id_partenaire: number): Observable<Service[]> {
    return this.http.get<Service[]>(`${API}/services/partenaire/${id_partenaire}`);
  }

  getService(id: number): Observable<Service> {
    return this.http.get<Service>(`${API}/services/${id}`);
  }

  createService(body: Omit<Service, 'id_service'>): Observable<Service> {
    return this.http.post<Service>(`${API}/services/`, body);
  }

  updateService(id: number, body: Partial<Service>): Observable<Service> {
    return this.http.put<Service>(`${API}/services/${id}`, body);
  }

  deleteService(id: number): Observable<Service> {
    return this.http.delete<Service>(`${API}/services/${id}`);
  }

  activateService(id: number): Observable<Service> {
    return this.http.patch<Service>(`${API}/services/${id}/activate`, {});
  }
}
```

---

## Configuration CORS

Pour autoriser Angular (ex. `http://localhost:4200`), ajouter dans `main.py` :

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Codes HTTP à gérer côté Angular

| Code | Cas |
|---|---|
| `200` | Succès (GET, PUT, DELETE, PATCH) |
| `201` | Création réussie (POST) |
| `400` | `id_partenaire` inexistant lors d'un POST service |
| `404` | Ressource introuvable |
| `422` | Erreur de validation — `error.error.detail` contient le détail champ par champ |
