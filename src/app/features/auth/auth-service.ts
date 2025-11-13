import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {LoginResponse} from './login/login';
import {UserModel} from '../../core/models/user.model';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService{
  http = inject(HttpClient);
  resourcePath = environment.apiUrl+"auth/";

  private currentUserSignal = signal<UserModel | null>(null);
  private currentTokenSignal = signal<string | null>(null);
  currentUser = this.currentUserSignal.asReadonly();
  token = this.currentTokenSignal.asReadonly();

  constructor(private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    const token = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSignal.set(user);
        this.currentTokenSignal.set(token);
      } catch (e) {
        console.error('Erreur lors du chargement de l\'utilisateur', e);
      }
    }
  }

  setAuthData(user: UserModel, access_token: string, remember: boolean = false) {
    this.currentUserSignal.set(user);
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(user));

    this.currentTokenSignal.set(access_token);
    storage.setItem('access_token', access_token);
  }

  logout() {
    this.currentUserSignal.set(null);
    this.currentTokenSignal.set(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('access_token');
    this.router.navigate(['/login']).then();
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  login(credentials: any){
    return this.http.post<LoginResponse>(this.resourcePath+"login/", credentials)
  }
}
