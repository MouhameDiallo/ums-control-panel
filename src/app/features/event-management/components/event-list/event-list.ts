import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {UniversityEvent} from '../../../../core/models/event.model';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {EventService} from '../../event.service';
import {EventForm} from '../event-form/event-form';

@Component({
  selector: 'app-event-list',
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    EventForm
  ],
  standalone: true,
  templateUrl: './event-list.html',
  styleUrl: './event-list.scss'
})
export class EventList implements OnInit {
  events!: UniversityEvent[];
  categories: string[] = ["Tous", "Conférence", "Événement", "Atelier", "Séminaire", "Culture", "Forum"];

  searchTerm: string = '';
  selectedCategory: string = 'Tous';
  currentPage: number = 1;
  itemsPerPage: number = 5;

  showForm= false;

  eventToEdit: UniversityEvent|null = null;

  constructor(private eventService: EventService,
              private ref: ChangeDetectorRef) {}

  filteredEvents: UniversityEvent[] = [];
  paginatedEvents: UniversityEvent[] = [];
  totalPages: number = 1;

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(){
    console.log("Loading")
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

}
