import { Component } from '@angular/core';
import {NgForOf} from '@angular/common';
import {RouterLink, RouterLinkActive} from '@angular/router';

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
  navItems = [
    { label: 'Tableau de Bord', route: '/', icon: '🏠' },
    { label: 'Gestion des Événements', route: '/events', icon: '📅' },
    { label: 'Gestion des Utilisateurs', route: '/admin/users', icon: '👥' },
    { label: 'Envoyer Notification Push', route: '/admin/notifications', icon: '🔔' },
    { label: 'Mon Profil', route: '/profile', icon: '👤' },
  ];
}
