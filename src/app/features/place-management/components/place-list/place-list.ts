import {Component, OnInit, signal} from '@angular/core';
import {PlaceModel} from '../../../../core/models/place.model';
import {PlaceService} from '../../place.service';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-place-list',
  imports: [
    NgIf,
    NgForOf,
    FormsModule
  ],
  standalone: true,
  templateUrl: './place-list.html',
  styleUrl: './place-list.scss'
})
export class PlaceList implements OnInit {
  places = signal<PlaceModel[]>([]);
  filteredPlaces = signal<PlaceModel[]>([]);
  loading = signal(false);
  editMode = signal(false);
  selectedPlaceId = signal<number | null>(null);
  searchTerm = '';

  placeForm: Partial<PlaceModel> = {
    nom: undefined,
    latitude: undefined,
    longitude: undefined
  };

  alertMessage = signal('');
  alertType = signal<'success' | 'error'>('success');

  constructor(private placeService: PlaceService) {}

  ngOnInit() {
    this.loadPlaces();
  }

  loadPlaces() {
    this.loading.set(true);
    this.placeService.getPlaces().subscribe({
      next: (data) => {
        this.places.set(data);
        this.filteredPlaces.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement:', err);
        this.showAlert('Erreur lors du chargement des lieux', 'error');
        this.loading.set(false);
      }
    });
  }

  filterPlaces() {
    const term = this.searchTerm.toLowerCase();
    const filtered = this.places().filter(place =>
      place.nom.toLowerCase().includes(term)
    );
    this.filteredPlaces.set(filtered);
  }

  savePlace() {
    if (!this.placeForm.nom || (!this.placeForm.latitude && !this.editMode()) || (!this.placeForm.longitude && !this.editMode())) {
      this.showAlert('Veuillez remplir tous les champs requis', 'error');
      return;
    }

    const payload: any = {
      nom: this.placeForm.nom,
      latitude: this.placeForm.latitude,
      longitude: this.placeForm.longitude,
    };

    if (this.editMode() && this.selectedPlaceId()) {
      // Update
      this.placeService.updatePlace(this.selectedPlaceId()!,payload).subscribe({
        next: () => {
          this.showAlert('Utilisateur modifié avec succès', 'success');
          this.loadPlaces();
          this.resetForm();
        },
        error: (err) => {
          this.showAlert(err.error?.detail || 'Erreur lors de la modification', 'error');
        }
      });
    } else {
      // Create
      this.placeService.createPlace(payload).subscribe({
        next: () => {
          this.showAlert('Lieu créé avec succès', 'success');
          this.loadPlaces();
          this.resetForm();
        },
        error: (err) => {
          this.showAlert(err.error?.detail || 'Erreur lors de la création', 'error');
        }
      });
    }
  }

  deletePlace(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
      return;
    }

    this.placeService.deletePlace(id).subscribe({
      next: () => {
        this.showAlert('Lieu supprimé avec succès', 'success');
        this.loadPlaces();
      },
      error: (err) => {
        this.showAlert(err.error?.detail || 'Erreur lors de la suppression', 'error');
      }
    });
  }

  cancelEdit() {
    this.resetForm();
  }

  resetForm() {
    this.editMode.set(false);
    this.selectedPlaceId.set(null);
    this.placeForm = {
      nom: undefined,
      latitude: undefined,
      longitude: undefined
    }
  }

  showAlert(message: string, type: 'success' | 'error') {
    this.alertMessage.set(message);
    this.alertType.set(type);
    setTimeout(() => this.alertMessage.set(''), 5000);
  }

  editPlace(place: PlaceModel) {
    console.log("Hello");
    this.editMode.set(true);
    this.selectedPlaceId.set(place.id);
    this.placeForm = {
      nom: place.nom,
      latitude: place.latitude,
      longitude: place.longitude
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
