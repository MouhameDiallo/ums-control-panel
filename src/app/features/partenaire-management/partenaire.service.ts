import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Partenaire,
  PartenaireCreate,
  ServicePublic,
  ServiceCreate,
  PaginatedResponse
} from '../../core/models/partenaire.model';

const PP_API = 'http://localhost:8090/api/v1';

@Injectable({ providedIn: 'root' })
export class PartenaireService {
  private http = inject(HttpClient);

  // ── Partenaires ──────────────────────────────────────────────

  getPartenaires(
    page = 1,
    size = 20,
    filters: { libelle?: string; est_actif?: boolean } = {}
  ): Observable<PaginatedResponse<Partenaire>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (filters.libelle) params = params.set('libelle', filters.libelle);
    if (filters.est_actif !== undefined) params = params.set('est_actif', String(filters.est_actif));
    return this.http.get<PaginatedResponse<Partenaire>>(`${PP_API}/partenaires/`, { params });
  }

  createPartenaire(body: PartenaireCreate): Observable<Partenaire> {
    return this.http.post<Partenaire>(`${PP_API}/partenaires/`, body);
  }

  updatePartenaire(id: number, body: Partial<PartenaireCreate>): Observable<Partenaire> {
    return this.http.put<Partenaire>(`${PP_API}/partenaires/${id}`, body);
  }

  deletePartenaire(id: number): Observable<Partenaire> {
    return this.http.delete<Partenaire>(`${PP_API}/partenaires/${id}`);
  }

  hardDeletePartenaire(id: number): Observable<void> {
    return this.http.delete<void>(`${PP_API}/partenaires/${id}/hard`);
  }

  activatePartenaire(id: number): Observable<Partenaire> {
    return this.http.patch<Partenaire>(`${PP_API}/partenaires/${id}/activate`, {});
  }

  // ── Services publics ─────────────────────────────────────────

  getServicesByPartenaire(idPartenaire: number): Observable<ServicePublic[]> {
    return this.http.get<ServicePublic[]>(`${PP_API}/services/partenaire/${idPartenaire}`);
  }

  createService(body: ServiceCreate): Observable<ServicePublic> {
    return this.http.post<ServicePublic>(`${PP_API}/services/`, body);
  }

  updateService(id: number, body: Partial<ServiceCreate>): Observable<ServicePublic> {
    return this.http.put<ServicePublic>(`${PP_API}/services/${id}`, body);
  }

  deleteService(id: number): Observable<ServicePublic> {
    return this.http.delete<ServicePublic>(`${PP_API}/services/${id}`);
  }

  activateService(id: number): Observable<ServicePublic> {
    return this.http.patch<ServicePublic>(`${PP_API}/services/${id}/activate`, {});
  }
}
