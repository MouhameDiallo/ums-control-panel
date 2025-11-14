import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NotificationService} from '../../notification.service';
import {NotificationWithTargets} from '../../../../core/models/notification.model';
import {RouterLink} from '@angular/router';
import {CibleModel} from '../../../../core/models/cible.model';

@Component({
  selector: 'app-notification-list',
  imports: [
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    DatePipe
  ],
  standalone: true,
  templateUrl: './notification-list.html',
  styleUrl: './notification-list.scss'
})
export class NotificationList implements OnInit{
  notifications!: NotificationWithTargets[];
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;

  totalItems: number = 0;
  totalPages: number = 1;

  constructor(private notificationService: NotificationService,
              private ref: ChangeDetectorRef) {

  }
  ngOnInit(): void {
    this.loadNotifications();
  }
  loadNotifications(){
    this.notificationService.getNotifications(
      (this.currentPage - 1) * this.itemsPerPage,
      this.itemsPerPage,).subscribe({
      next: value => {
        this.totalItems = value.length < this.itemsPerPage
          ? (this.currentPage - 1) * this.itemsPerPage + value.length
          : this.currentPage * this.itemsPerPage + 1;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.notifications = value;
        this.ref.detectChanges();
      },
    })
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadNotifications();
    }
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  previousPage() {
    this.goToPage(this.currentPage - 1);
  }

  onFilterChange() {

  }

  getTypeOfRecipient(cibles: CibleModel[]){
    const set = new Set(cibles.map(target => target.type));
    return Array.from(set.values());
  }
}
