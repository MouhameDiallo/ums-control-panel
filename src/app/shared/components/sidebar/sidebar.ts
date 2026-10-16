import { Component } from '@angular/core';
import {NgForOf} from '@angular/common';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {AuthService} from '../../../features/auth/auth-service';

@Component({
  selector: 'app-sidebar',
  imports: [
    NgForOf,
    RouterLink,
    RouterLinkActive
  ],
  standalone: true,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  constructor(private authService: AuthService) {
  }
  navItems = [
    // { label: 'Tableau de Bord', route: '/dashboards', icon: '🏠' },
    { label: 'Gestion des Événements', route: '/events', icon: '' },
    // { label: 'Gestion des Utilisateurs', route: '/admin/users', icon: '👥' },
    { label: 'Envoyer Notification Push', route: '/admin/notifications', icon: '' },
    { label: 'Gestion lieux', route: '/admin/lieux', icon: '' },
    // { label: 'Gestion Doc. RAG', route: '/admin/chatbot/upload', icon: '📂' },
    // { label: 'Partenaires & Services', route: '/admin/partenaires', icon: '🤝' },

  ];
  logout() {
    this.authService.logout();
  }
}
