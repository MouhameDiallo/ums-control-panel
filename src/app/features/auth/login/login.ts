import {Component, signal} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../auth-service';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_info: {
    id_user: number;
    login: string;
    role: 'admin' | 'user';
  };
}
@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    NgIf
  ],
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  // private apiUrl = 'http://localhost:8000/users/login';

  credentials = {
    login: '',
    password: ''
  };

  rememberMe = false;
  loading = signal(false);
  showPassword = signal(false);
  showError = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.showPassword.update(val => !val);
  }

  login() {
    // Validation
    if (!this.credentials.login || !this.credentials.password) {
      this.showError.set(true);
      this.setError('Veuillez remplir tous les champs');
      return;
    }

    this.loading.set(true);
    this.showError.set(false);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.successMessage.set(`Bienvenue ${response.user_info.login} !`);

        // Stocker les infos utilisateur
        if (this.rememberMe) {
          localStorage.setItem('user', JSON.stringify(response.user_info));
        } else {
          sessionStorage.setItem('user', JSON.stringify(response.user_info));
          sessionStorage.setItem('access_token', JSON.stringify(response.access_token));
        }

        this.router.navigate(['/events']).then();
      },
      error: (err) => {
        this.loading.set(false);
        this.showError.set(true);

        const errorMsg = err.error?.detail || 'Identifiant ou mot de passe incorrect';
        this.setError(errorMsg);
      }
    });
  }

  private setError(message: string) {
    this.errorMessage.set(message);
    setTimeout(() => {
      this.errorMessage.set('');
      this.showError.set(false);
    }, 5000);
  }
}
