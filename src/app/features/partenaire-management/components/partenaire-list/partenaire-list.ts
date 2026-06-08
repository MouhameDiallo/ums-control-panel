import { Component, OnInit, signal } from '@angular/core';
import { NgForOf, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartenaireService } from '../../partenaire.service';
import {
  Partenaire,
  PartenaireCreate,
  ServicePublic,
  ServiceCreate,
  PaginatedResponse
} from '../../../../core/models/partenaire.model';

@Component({
  selector: 'app-partenaire-list',
  standalone: true,
  imports: [NgIf, NgForOf, FormsModule, DatePipe],
  templateUrl: './partenaire-list.html',
  styleUrl: './partenaire-list.scss'
})
export class PartenaireList implements OnInit {

  // ── Partenaires state ────────────────────────────────────────
  partenaires = signal<Partenaire[]>([]);
  loadingPartenaires = signal(false);
  totalPartenaires = signal(0);
  currentPage = signal(1);
  pageSize = 20;
  searchLibelle = '';
  filterActif: 'tous' | 'actif' | 'inactif' = 'tous';

  showPartenaireForm = signal(false);
  editingPartenaire = signal<Partenaire | null>(null);
  partenaireForm: Partial<PartenaireCreate> & { id_partenaire?: number } = this.emptyPartenaireForm();
  showPassword = false;

  // ── Services state ───────────────────────────────────────────
  selectedPartenaire = signal<Partenaire | null>(null);
  services = signal<ServicePublic[]>([]);
  loadingServices = signal(false);

  showServiceForm = signal(false);
  editingService = signal<ServicePublic | null>(null);
  serviceForm: Partial<ServiceCreate> = this.emptyServiceForm();

  // ── Hard delete confirmation ─────────────────────────────────
  partenaireToHardDelete = signal<Partenaire | null>(null);

  // ── Alerts ───────────────────────────────────────────────────
  alertMessage = signal('');
  alertType = signal<'success' | 'error'>('success');
  serviceAlertMessage = signal('');
  serviceAlertType = signal<'success' | 'error'>('success');

  constructor(private service: PartenaireService) {}

  ngOnInit() {
    this.loadPartenaires();
  }

  // ── Partenaires ──────────────────────────────────────────────

  get totalPages(): number {
    return Math.ceil(this.totalPartenaires() / this.pageSize);
  }

  loadPartenaires() {
    this.loadingPartenaires.set(true);
    const filters: { libelle?: string; est_actif?: boolean } = {};
    if (this.searchLibelle.trim()) filters.libelle = this.searchLibelle.trim();
    if (this.filterActif === 'actif') filters.est_actif = true;
    if (this.filterActif === 'inactif') filters.est_actif = false;

    this.service.getPartenaires(this.currentPage(), this.pageSize, filters).subscribe({
      next: (res: PaginatedResponse<Partenaire>) => {
        this.partenaires.set(res.items);
        this.totalPartenaires.set(res.total);
        this.loadingPartenaires.set(false);
      },
      error: (err) => {
        this.showAlert('Erreur lors du chargement des partenaires', 'error');
        this.loadingPartenaires.set(false);
      }
    });
  }

  onSearch() {
    this.currentPage.set(1);
    this.loadPartenaires();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage.set(page);
    this.loadPartenaires();
  }

  openCreatePartenaire() {
    this.editingPartenaire.set(null);
    this.partenaireForm = this.emptyPartenaireForm();
    this.showPassword = false;
    this.showPartenaireForm.set(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  }

  openEditPartenaire(p: Partenaire) {
    this.editingPartenaire.set(p);
    this.partenaireForm = {
      libelle: p.libelle,
      description: p.description ?? '',
      login: p.login,
      password: '',
      est_actif: p.est_actif
    };
    this.showPassword = false;
    this.showPartenaireForm.set(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  }

  savePartenaire() {
    const editing = this.editingPartenaire();
    if (!this.partenaireForm.libelle?.trim() || !this.partenaireForm.login?.trim()) {
      this.showAlert('Libellé et login sont requis', 'error');
      return;
    }
    if (!editing && !this.partenaireForm.password?.trim()) {
      this.showAlert('Le mot de passe est requis à la création', 'error');
      return;
    }

    if (editing) {
      const body: Partial<PartenaireCreate> = {
        libelle: this.partenaireForm.libelle,
        description: this.partenaireForm.description,
        login: this.partenaireForm.login,
        est_actif: this.partenaireForm.est_actif
      };
      if (this.partenaireForm.password?.trim()) {
        body.password = this.partenaireForm.password;
      }
      this.service.updatePartenaire(editing.id_partenaire, body).subscribe({
        next: () => {
          this.showAlert('Partenaire modifié avec succès', 'success');
          this.resetPartenaireForm();
          this.loadPartenaires();
        },
        error: (err) => this.showAlert(this.extractError(err, 'Erreur lors de la modification'), 'error')
      });
    } else {
      const body: PartenaireCreate = {
        libelle: this.partenaireForm.libelle!,
        description: this.partenaireForm.description,
        login: this.partenaireForm.login!,
        password: this.partenaireForm.password!,
        est_actif: this.partenaireForm.est_actif ?? true
      };
      this.service.createPartenaire(body).subscribe({
        next: () => {
          this.showAlert('Partenaire créé avec succès', 'success');
          this.resetPartenaireForm();
          this.loadPartenaires();
        },
        error: (err) => this.showAlert(this.extractError(err, 'Erreur lors de la création'), 'error')
      });
    }
  }

  togglePartenaireStatus(p: Partenaire) {
    const action = p.est_actif
      ? this.service.deletePartenaire(p.id_partenaire)
      : this.service.activatePartenaire(p.id_partenaire);

    action.subscribe({
      next: () => {
        this.showAlert(`Partenaire ${p.est_actif ? 'désactivé' : 'activé'} avec succès`, 'success');
        if (this.selectedPartenaire()?.id_partenaire === p.id_partenaire && p.est_actif) {
          this.selectedPartenaire.set(null);
        }
        this.loadPartenaires();
      },
      error: (err) => this.showAlert(this.extractError(err, 'Erreur lors du changement de statut'), 'error')
    });
  }

  selectPartenaire(p: Partenaire) {
    if (this.selectedPartenaire()?.id_partenaire === p.id_partenaire) {
      this.selectedPartenaire.set(null);
      this.services.set([]);
      this.resetServiceForm();
    } else {
      this.selectedPartenaire.set(p);
      this.resetServiceForm();
      this.loadServices(p.id_partenaire);
      setTimeout(() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }

  openHardDeleteConfirm(p: Partenaire) {
    this.partenaireToHardDelete.set(p);
  }

  confirmHardDelete() {
    const p = this.partenaireToHardDelete();
    if (!p) return;
    this.service.hardDeletePartenaire(p.id_partenaire).subscribe({
      next: () => {
        this.partenaireToHardDelete.set(null);
        if (this.selectedPartenaire()?.id_partenaire === p.id_partenaire) {
          this.selectedPartenaire.set(null);
          this.services.set([]);
        }
        this.showAlert(`Partenaire "${p.libelle}" supprimé définitivement`, 'success');
        this.loadPartenaires();
      },
      error: (err) => {
        this.partenaireToHardDelete.set(null);
        this.showAlert(this.extractError(err, 'Erreur lors de la suppression définitive'), 'error');
      }
    });
  }

  cancelHardDelete() {
    this.partenaireToHardDelete.set(null);
  }

  cancelPartenaireForm() {
    this.resetPartenaireForm();
  }

  resetPartenaireForm() {
    this.showPartenaireForm.set(false);
    this.editingPartenaire.set(null);
    this.partenaireForm = this.emptyPartenaireForm();
  }

  emptyPartenaireForm(): Partial<PartenaireCreate> {
    return { libelle: '', description: '', login: '', password: '', est_actif: true };
  }

  // ── Services ─────────────────────────────────────────────────

  loadServices(idPartenaire: number) {
    this.loadingServices.set(true);
    this.service.getServicesByPartenaire(idPartenaire).subscribe({
      next: (data) => {
        this.services.set(data);
        this.loadingServices.set(false);
      },
      error: () => {
        this.showServiceAlert('Erreur lors du chargement des services', 'error');
        this.loadingServices.set(false);
      }
    });
  }

  openCreateService() {
    this.editingService.set(null);
    this.serviceForm = this.emptyServiceForm();
    this.serviceForm.id_partenaire = this.selectedPartenaire()!.id_partenaire;
    this.showServiceForm.set(true);
  }

  openEditService(s: ServicePublic) {
    this.editingService.set(s);
    this.serviceForm = {
      nom_service: s.nom_service,
      description: s.description ?? '',
      date_creation: s.date_creation ?? '',
      est_actif: s.est_actif ?? true,
      id_partenaire: s.id_partenaire
    };
    this.showServiceForm.set(true);
  }

  saveService() {
    if (!this.serviceForm.nom_service?.trim()) {
      this.showServiceAlert('Le nom du service est requis', 'error');
      return;
    }
    const editing = this.editingService();
    if (editing) {
      const body: Partial<ServiceCreate> = {
        nom_service: this.serviceForm.nom_service,
        description: this.serviceForm.description,
        est_actif: this.serviceForm.est_actif,
        id_partenaire: this.serviceForm.id_partenaire
      };
      this.service.updateService(editing.id_service, body).subscribe({
        next: () => {
          this.showServiceAlert('Service modifié avec succès', 'success');
          this.resetServiceForm();
          this.loadServices(this.selectedPartenaire()!.id_partenaire);
        },
        error: (err) => this.showServiceAlert(this.extractError(err, 'Erreur lors de la modification'), 'error')
      });
    } else {
      const body: ServiceCreate = {
        nom_service: this.serviceForm.nom_service!,
        description: this.serviceForm.description,
        date_creation: this.serviceForm.date_creation || undefined,
        est_actif: this.serviceForm.est_actif ?? true,
        id_partenaire: this.selectedPartenaire()!.id_partenaire
      };
      this.service.createService(body).subscribe({
        next: () => {
          this.showServiceAlert('Service créé avec succès', 'success');
          this.resetServiceForm();
          this.loadServices(this.selectedPartenaire()!.id_partenaire);
        },
        error: (err) => this.showServiceAlert(this.extractError(err, 'Erreur lors de la création'), 'error')
      });
    }
  }

  toggleServiceStatus(s: ServicePublic) {
    const action = s.est_actif
      ? this.service.deleteService(s.id_service)
      : this.service.activateService(s.id_service);

    action.subscribe({
      next: () => {
        this.showServiceAlert(`Service ${s.est_actif ? 'désactivé' : 'activé'} avec succès`, 'success');
        this.loadServices(this.selectedPartenaire()!.id_partenaire);
      },
      error: (err) => this.showServiceAlert(this.extractError(err, 'Erreur lors du changement de statut'), 'error')
    });
  }

  cancelServiceForm() {
    this.resetServiceForm();
  }

  resetServiceForm() {
    this.showServiceForm.set(false);
    this.editingService.set(null);
    this.serviceForm = this.emptyServiceForm();
  }

  emptyServiceForm(): Partial<ServiceCreate> {
    return { nom_service: '', description: '', est_actif: true };
  }

  // ── Helpers ──────────────────────────────────────────────────

  showAlert(message: string, type: 'success' | 'error') {
    this.alertMessage.set(message);
    this.alertType.set(type);
    setTimeout(() => this.alertMessage.set(''), 5000);
  }

  showServiceAlert(message: string, type: 'success' | 'error') {
    this.serviceAlertMessage.set(message);
    this.serviceAlertType.set(type);
    setTimeout(() => this.serviceAlertMessage.set(''), 5000);
  }

  extractError(err: any, fallback: string): string {
    if (err?.error?.detail) {
      if (Array.isArray(err.error.detail)) {
        return err.error.detail.map((d: any) => d.msg).join(', ');
      }
      return err.error.detail;
    }
    return fallback;
  }

  getPages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const current = this.currentPage();
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }
}
