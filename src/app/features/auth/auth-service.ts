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
  currentUser = this.currentUserSignal.asReadonly();

  constructor(private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSignal.set(user);
      } catch (e) {
        console.error('Erreur lors du chargement de l\'utilisateur', e);
      }
    }
  }

  setUser(user: UserModel, remember: boolean = false) {
    this.currentUserSignal.set(user);
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(user));
  }

  logout() {
    this.currentUserSignal.set(null);
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
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
