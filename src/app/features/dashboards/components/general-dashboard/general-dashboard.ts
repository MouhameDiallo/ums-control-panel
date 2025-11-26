import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DecimalPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {HttpClient} from '@angular/common/http';

interface DashboardStats {
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

interface NotificationParJour {
  date: string;
  count: number;
}

interface NotificationParType {
  type: string;
  count: number;
  percentage: number;
}

interface TopUtilisateur {
  id_user: number;
  login: string;
  nombre_notifications: number;
}

interface RecentNotification {
  id_notification: number;
  titre: string;
  message: string;
  date_creation: string;
  nombre_cibles: number;
  user_login: string;
}

interface UpcomingEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url?: string;
  category: string;
}

interface NotificationTrend {
  periode: string;
  notifications: number;
  variation_percentage: number;
}

@Component({
  selector: 'app-general-dashboard',
  imports: [
    NgIf,
    NgForOf,
    DecimalPipe,
    NgClass
  ],
  standalone: true,
  templateUrl: './general-dashboard.html',
  styleUrl: './general-dashboard.scss'
})
export class GeneralDashboard implements OnInit {
  private apiUrl = 'http://localhost:8000/api/v1/dashboard';

  stats: DashboardStats | null = null;
  notifParJour: NotificationParJour[] = [];
  notifParType: NotificationParType[] = [];
  topUsers: TopUtilisateur[] = [];
  recentNotifs: RecentNotification[] = [];
  upcomingEvents: UpcomingEvent[] = [];
  trends: NotificationTrend[] = [];
  loading = true;

  // Pour les graphiques
  maxNotifPerDay = 0;
  maxUserNotif = 0;

  constructor(private http: HttpClient,
              private ref: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  async loadDashboardData(): Promise<void> {
    try {
      // En production, utilisez vos vrais endpoints
      // Pour la démo, j'utilise des données simulées
      this.stats = await this.getStatsDemo();
      this.notifParJour = await this.getNotificationsParJourDemo();
      this.notifParType = await this.getNotificationsParTypeDemo();
      this.topUsers = await this.getTopUtilisateursDemo();
      this.recentNotifs = await this.getRecentNotificationsDemo();
      this.upcomingEvents = await this.getUpcomingEventsDemo();
      this.trends = await this.getNotificationTrendsDemo();

      // Calculer les valeurs max pour les graphiques
      this.maxNotifPerDay = Math.max(...this.notifParJour.map(n => n.count));
      this.maxUserNotif = Math.max(...this.topUsers.map(u => u.nombre_notifications));

      this.loading = false;
      this.ref.detectChanges();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.loading = false;
    }
  }

  // Méthodes pour appeler les vrais endpoints (décommentez et utilisez en production)
  /*
  async getStats(): Promise<DashboardStats> {
    return firstValueFrom(this.http.get<DashboardStats>(`${this.apiUrl}/stats`));
  }

  async getNotificationsParJour(days = 30): Promise<NotificationParJour[]> {
    return firstValueFrom(
      this.http.get<NotificationParJour[]>(`${this.apiUrl}/notifications/par-jour?days=${days}`)
    );
  }

  async getNotificationsParType(): Promise<NotificationParType[]> {
    return firstValueFrom(
      this.http.get<NotificationParType[]>(`${this.apiUrl}/notifications/par-type`)
    );
  }

  async getTopUtilisateurs(limit = 5): Promise<TopUtilisateur[]> {
    return firstValueFrom(
      this.http.get<TopUtilisateur[]>(`${this.apiUrl}/top-utilisateurs?limit=${limit}`)
    );
  }

  async getRecentNotifications(limit = 3): Promise<RecentNotification[]> {
    return firstValueFrom(
      this.http.get<RecentNotification[]>(`${this.apiUrl}/notifications/recentes?limit=${limit}`)
    );
  }

  async getUpcomingEvents(limit = 3): Promise<UpcomingEvent[]> {
    return firstValueFrom(
      this.http.get<UpcomingEvent[]>(`${this.apiUrl}/events/prochains?limit=${limit}`)
    );
  }

  async getNotificationTrends(): Promise<NotificationTrend[]> {
    return firstValueFrom(
      this.http.get<NotificationTrend[]>(`${this.apiUrl}/notifications/tendance`)
    );
  }
  */

  // Méthodes de démonstration (à remplacer par les vraies en production)
  private async getStatsDemo(): Promise<DashboardStats> {
    return {
      total_notifications: 1247,
      total_cibles: 3456,
      total_etudiants: 2340,
      total_personnels: 456,
      total_groupes: 89,
      total_events: 23,
      notifications_today: 45,
      notifications_this_week: 234,
      notifications_this_month: 876
    };
  }

  private async getNotificationsParJourDemo(): Promise<NotificationParJour[]> {
    const days: NotificationParJour[] = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 50) + 10
      });
    }
    return days;
  }

  private async getNotificationsParTypeDemo(): Promise<NotificationParType[]> {
    return [
      { type: 'etudiant', count: 567, percentage: 45.5 },
      { type: 'personnel', count: 423, percentage: 33.9 },
      { type: 'groupe', count: 257, percentage: 20.6 }
    ];
  }

  private async getTopUtilisateursDemo(): Promise<TopUtilisateur[]> {
    return [
      { id_user: 1, login: 'admin@univ.sn', nombre_notifications: 234 },
      { id_user: 2, login: 'prof.diallo@univ.sn', nombre_notifications: 187 },
      { id_user: 3, login: 'secretariat@univ.sn', nombre_notifications: 156 },
      { id_user: 4, login: 'dean@univ.sn', nombre_notifications: 143 },
      { id_user: 5, login: 'etudiant.rep@univ.sn', nombre_notifications: 98 }
    ];
  }

  private async getRecentNotificationsDemo(): Promise<RecentNotification[]> {
    return [
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
    ];
  }

  private async getUpcomingEventsDemo(): Promise<UpcomingEvent[]> {
    return [
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
    ];
  }

  private async getNotificationTrendsDemo(): Promise<NotificationTrend[]> {
    return [
      { periode: '2024-06', notifications: 234, variation_percentage: 12.5 },
      { periode: '2024-07', notifications: 278, variation_percentage: 18.8 },
      { periode: '2024-08', notifications: 312, variation_percentage: 12.2 },
      { periode: '2024-09', notifications: 289, variation_percentage: -7.4 },
      { periode: '2024-10', notifications: 356, variation_percentage: 23.2 },
      { periode: '2024-11', notifications: 398, variation_percentage: 11.8 }
    ];
  }

  // Méthodes utilitaires
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      etudiant: '🎓',
      personnel: '👨‍🏫',
      groupe: '👥'
    };
    return icons[type] || '📋';
  }

  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      etudiant: '#3b82f6',
      personnel: '#10b981',
      groupe: '#f59e0b'
    };
    return colors[type] || '#6b7280';
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Orientation': 'bg-blue-100 text-blue-800',
      'Académique': 'bg-purple-100 text-purple-800',
      'Sport': 'bg-green-100 text-green-800',
      'Culture': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  }

  getBarWidth(value: number, max: number): string {
    return `${(value / max) * 100}%`;
  }

  getTrendIcon(variation: number): string {
    return variation >= 0 ? '📈' : '📉';
  }

  getTrendColor(variation: number): string {
    return variation >= 0 ? 'text-green-600' : 'text-red-600';
  }

  getNumber(i: number) {
    return this.notifParType.slice(0, i).reduce((sum, t) => sum + (t.percentage / 100 * 251.2), 0)
  }
}
