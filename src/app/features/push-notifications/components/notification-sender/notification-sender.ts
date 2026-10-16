import {Component, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NotificationService} from '../../services/notification.service';
import {CibleService} from '../../services/cible.service';

@Component({
  selector: 'app-notification-sender',
  imports: [
    NgIf,
    FormsModule,
    NgForOf
  ],
  standalone: true,
  templateUrl: './notification-sender.html',
  styleUrl: './notification-sender.scss'
})
export class NotificationSender implements OnInit {
  notification: NotificationCreate = {
    titre: '',
    message: '',
    media_url: '',
    target_ids: []
  };

  cibles: Cible[] = [];
  selectedTargets: number[] = [];
  filterType: 'tous' | 'etudiant' | 'personnel' | 'groupe' = 'tous';
  searchQuery: string = '';
  loading: boolean = false;
  sending: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';


  constructor(
    private notificationService: NotificationService,
    private cibleService: CibleService,
  ) {}

  ngOnInit(): void {
    this.loadCibles();
  }

  loadCibles(): void {
    this.loading = true;
    // Remplacez par votre endpoint réel
    this.cibleService.loadCibles().subscribe({
      next: (data) => {
        this.cibles = data.map(c => ({
          ...c,
          label: this.getCibleLabel(c)
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des cibles:', err);
        this.errorMessage = 'Impossible de charger les destinataires';
        this.loading = false;
      }
    });
  }


  getCibleLabel(cible: Cible): string {
    if (cible.type === 'etudiant') return `Étudiant ${cible.numero}`;
    if (cible.type === 'personnel') return `Personnel ${cible.matricule}`;
    return `Groupe ${cible.code}`;
  }

  getFilteredCibles(): Cible[] {
    return this.cibles.filter(c => {
      const matchesType = this.filterType === 'tous' || c.type === this.filterType;
      const matchesSearch = !this.searchQuery ||
        c.label?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        c.numero?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        c.matricule?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        c.code?.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }

  isSelected(id: number): boolean {
    return this.selectedTargets.includes(id);
  }

  toggleTarget(id: number): void {
    const index = this.selectedTargets.indexOf(id);
    if (index > -1) {
      this.selectedTargets.splice(index, 1);
    } else {
      this.selectedTargets.push(id);
    }
  }

  selectAll(): void {
    this.selectedTargets = this.getFilteredCibles().map(c => c.id_cible);
  }

  deselectAll(): void {
    this.selectedTargets = [];
  }

  sendNotification(): void {
    if (this.selectedTargets.length === 0) {
      this.errorMessage = 'Veuillez sélectionner au moins un destinataire';
      return;
    }

    this.sending = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload: NotificationCreate = {
      titre: this.notification.titre,
      message: this.notification.message,
      media_url: this.notification.media_url || undefined,
      target_ids: this.selectedTargets
    };

    this.notificationService.createNotification(payload).subscribe({
      next: (response) => {
        this.successMessage = `${response.message} (${response.tokens_sent_to} token(s) envoyé(s))`;
        this.sending = false;
        setTimeout(() => this.resetForm(), 3000);
      },
      error: (err) => {
        console.error('Erreur lors de l\'envoi:', err);
        this.errorMessage = err.error?.detail || 'Erreur lors de l\'envoi de la notification';
        this.sending = false;
      }
    });
  }

  resetForm(): void {
    this.notification = {
      titre: '',
      message: '',
      media_url: '',
      target_ids: []
    };
    this.selectedTargets = [];
    this.filterType = 'tous';
    this.searchQuery = '';
    this.successMessage = '';
    this.errorMessage = '';
  }
}
