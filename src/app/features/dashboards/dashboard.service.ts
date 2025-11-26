import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// Interfaces pour les structures de données
export interface DashboardStats {
  total_notifications: number;
  total_cibles: number;
  total_etudiants: number;
  total_personnels: number;
  total_groupes: number;
  total_events: number;
  notifications_today: number;
  notifications_this_week: number;
  notifications_this_month: number;
}

export interface NotificationParJour {
  date: string;
  count: number;
}

export interface NotificationParType {
  type: string;
  count: number;
  percentage: number;
}

export interface TopUtilisateur {
  id_user: number;
  login: string;
  nombre_notifications: number;
}

export interface RecentNotification {
  id_notification: number;
  titre: string;
  message: string;
  date_creation: string;
  nombre_cibles: number;
  user_login: string;
}

export interface UpcomingEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
}

export interface NotificationTrend {
  periode: string;
  notifications: number;
  variation_percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly SIMULATION_DELAY = 500; // Délai pour simuler un appel réseau

  constructor() { }

  getStats(): Observable<DashboardStats> {
    return of({
      total_notifications: 1247,
      total_cibles: 3456,
      total_etudiants: 2340,
      total_personnels: 456,
      total_groupes: 89,
      total_events: 23,
      notifications_today: 45,
      notifications_this_week: 234,
      notifications_this_month: 876
    }).pipe(delay(this.SIMULATION_DELAY));
  }

  getNotificationsParJour(): Observable<NotificationParJour[]> {
    const days: NotificationParJour[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 50) + 10
      });
    }
    return of(days).pipe(delay(this.SIMULATION_DELAY));
  }

  getNotificationsParType(): Observable<NotificationParType[]> {
    return of([
      { type: 'Étudiant', count: 567, percentage: 45.5, name: 'Étudiant' },
      { type: 'Personnel', count: 423, percentage: 33.9, name: 'Personnel' },
      { type: 'Groupe', count: 257, percentage: 20.6, name: 'Groupe' }
    ] as any).pipe(delay(this.SIMULATION_DELAY));
  }

  getTopUtilisateurs(): Observable<TopUtilisateur[]> {
    return of([
      { id_user: 1, login: 'admin@univ.sn', nombre_notifications: 234, name: 'admin@univ.sn', value: 234 },
      { id_user: 2, login: 'prof.diallo@univ.sn', nombre_notifications: 187, name: 'prof.diallo@univ.sn', value: 187 },
      { id_user: 3, login: 'secretariat@univ.sn', nombre_notifications: 156, name: 'secretariat@univ.sn', value: 156 },
      { id_user: 4, login: 'dean@univ.sn', nombre_notifications: 143, name: 'dean@univ.sn', value: 143 },
      { id_user: 5, login: 'etudiant.rep@univ.sn', nombre_notifications: 98, name: 'etudiant.rep@univ.sn', value: 98 }
    ] as any).pipe(delay(this.SIMULATION_DELAY));
  }

  getRecentNotifications(): Observable<RecentNotification[]> {
    return of([
      {
        id_notification: 1,
        titre: 'Réunion importante',
        message: 'Tous les étudiants de L3 sont invités à la réunion de demain...',
        date_creation: new Date().toISOString(),
        nombre_cibles: 234,
        user_login: 'admin@univ.sn'
      },
      {
        id_notification: 2,
        titre: 'Examens de fin de semestre',
        message: 'Les examens débuteront le 15 décembre. Veuillez consulter...',
        date_creation: new Date(Date.now() - 3600000).toISOString(),
        nombre_cibles: 1240,
        user_login: 'secretariat@univ.sn'
      },
      {
        id_notification: 3,
        titre: 'Nouvelle bibliothèque',
        message: 'La nouvelle bibliothèque numérique est maintenant accessible...',
        date_creation: new Date(Date.now() - 7200000).toISOString(),
        nombre_cibles: 2340,
        user_login: 'dean@univ.sn'
      }
    ]).pipe(delay(this.SIMULATION_DELAY));
  }

  getUpcomingEvents(): Observable<UpcomingEvent[]> {
    return of([
      {
        id: 1,
        title: 'Journée Portes Ouvertes',
        description: 'Découvrez notre université',
        date: new Date(Date.now() + 86400000 * 5).toISOString(),
        location: 'Campus Principal',
        category: 'Orientation'
      },
      {
        id: 2,
        title: 'Conférence sur l\'IA',
        description: 'Intelligence Artificielle et Éducation',
        date: new Date(Date.now() + 86400000 * 12).toISOString(),
        location: 'Amphithéâtre A',
        category: 'Académique'
      },
      {
        id: 3,
        title: 'Tournoi Sportif Inter-Facultés',
        description: 'Football et Basketball',
        date: new Date(Date.now() + 86400000 * 18).toISOString(),
        location: 'Stade Universitaire',
        category: 'Sport'
      }
    ]).pipe(delay(this.SIMULATION_DELAY));
  }

  getNotificationTrends(): Observable<NotificationTrend[]> {
    const trends: NotificationTrend[] = [
      { periode: '2024-06', notifications: 234, variation_percentage: 12.5 },
      { periode: '2024-07', notifications: 278, variation_percentage: 18.8 },
      { periode: '2024-08', notifications: 312, variation_percentage: 12.2 },
      { periode: '2024-09', notifications: 289, variation_percentage: -7.4 },
      { periode: '2024-10', notifications: 356, variation_percentage: 23.2 },
      { periode: '2024-11', notifications: 398, variation_percentage: 11.8 }
    ];
    // Adapter les données pour ngx-charts (Series pour LineChart)
    const trendsChartData = [{
      name: 'Notifications',
      series: trends.map(t => ({
        name: t.periode,
        value: t.notifications
      }))
    }];

    return of(trendsChartData as any).pipe(delay(this.SIMULATION_DELAY));
  }
}
