import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {UniversityEvent} from '../../../../core/models/event.model';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {EventService} from '../../event.service';

@Component({
  selector: 'app-event-list',
  imports: [
    FormsModule,
    NgForOf,
    NgIf
  ],
  standalone: true,
  templateUrl: './event-list.html',
  styleUrl: './event-list.scss'
})
export class EventList implements OnInit {
  // events: UniversityEvent[] = [
  //   {
  //     id: 1,
  //     title: "Conférence sur l'Intelligence Artificielle",
  //     description: "Découvrez les dernières avancées en IA avec nos experts",
  //     date: "2025-10-20T14:00:00",
  //     location: "Amphithéâtre A",
  //     category: "Conférence",
  //     image_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400"
  //   },
  //   {
  //     id: 2,
  //     title: "Journée Portes Ouvertes",
  //     description: "Venez découvrir notre campus et nos formations",
  //     date: "2025-10-25T09:00:00",
  //     location: "Campus Principal",
  //     category: "Événement",
  //     image_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400"
  //   },
  //   {
  //     id: 3,
  //     title: "Atelier de Robotique",
  //     description: "Initiation pratique à la programmation de robots",
  //     date: "2025-11-05T15:00:00",
  //     location: "Laboratoire B12",
  //     category: "Atelier",
  //     image_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400"
  //   },
  //   {
  //     id: 4,
  //     title: "Séminaire Entrepreneuriat",
  //     description: "Comment créer sa startup après les études",
  //     date: "2025-11-10T10:00:00",
  //     location: "Salle des Conférences",
  //     category: "Séminaire",
  //     image_url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400"
  //   },
  //   {
  //     id: 5,
  //     title: "Concert du Printemps",
  //     description: "Soirée musicale avec l'orchestre de l'université",
  //     date: "2025-11-15T19:00:00",
  //     location: "Auditorium Central",
  //     category: "Culture",
  //     image_url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400"
  //   },
  //   {
  //     id: 6,
  //     title: "Forum des Entreprises",
  //     description: "Rencontrez plus de 50 entreprises partenaires",
  //     date: "2025-11-20T08:00:00",
  //     location: "Hall d'Exposition",
  //     category: "Forum",
  //     image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400"
  //   }
  // ];
  events!: UniversityEvent[];
  categories: string[] = ["Tous", "Conférence", "Événement", "Atelier", "Séminaire", "Culture", "Forum"];

  searchTerm: string = '';
  selectedCategory: string = 'Tous';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  showCreateModal: boolean = false;

  newEvent: Partial<UniversityEvent> = {
    title: '',
    description: '',
    date: '',
    location: '',
    category: 'Conférence',
    image_url: ''
  };

  constructor(private eventService: EventService,
              private ref: ChangeDetectorRef) {}

  filteredEvents: UniversityEvent[] = [];
  paginatedEvents: UniversityEvent[] = [];
  totalPages: number = 1;

  ngOnInit(): void {
    this.eventService.getEvents().subscribe({
      next: value => {
        this.events = value;
        this.applyFilters();
        this.ref.detectChanges();
      }
    })

  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredEvents = this.events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.selectedCategory === 'Tous' || event.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });

    this.totalPages = Math.ceil(this.filteredEvents.length / this.itemsPerPage);
    this.updatePaginatedEvents();
  }

  updatePaginatedEvents(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedEvents = this.filteredEvents.slice(startIndex, startIndex + this.itemsPerPage);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedEvents();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedEvents();
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  handleCreateEvent(): void {
    if (!this.newEvent.title || !this.newEvent.description ||
      !this.newEvent.date || !this.newEvent.location) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const eventToCreate: UniversityEvent = {
      id: this.events.length + 1,
      title: this.newEvent.title,
      description: this.newEvent.description,
      date: this.newEvent.date,
      location: this.newEvent.location,
      category: this.newEvent.category || 'Conférence',
      image_url: this.newEvent.image_url
    };

    this.events.push(eventToCreate);
    this.applyFilters();
    this.closeModal();
  }

  closeModal(): void {
    this.showCreateModal = false;
    this.newEvent = {
      title: '',
      description: '',
      date: '',
      location: '',
      category: 'Conférence',
      image_url: ''
    };
  }
}
