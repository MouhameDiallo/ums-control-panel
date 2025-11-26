import {Component, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {UserModel} from '../../../../core/models/user.model';
import {UserService} from '../../user.service';


interface UserForm {
  login: string;
  password: string;
  role: 'admin' | 'user';
}

@Component({
  selector: 'app-user-list',
  imports: [
    FormsModule,
    NgForOf,
    NgIf
  ],
  standalone: true,
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss'
})
export class UserList implements OnInit {
  users = signal<UserModel[]>([]);
  filteredUsers = signal<UserModel[]>([]);
  loading = signal(false);
  editMode = signal(false);
  selectedUserId = signal<number | null>(null);
  searchTerm = '';

  userForm: UserForm = {
    login: '',
    password: '',
    role: 'user'
  };

  alertMessage = signal('');
  alertType = signal<'success' | 'error'>('success');

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.filteredUsers.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement:', err);
        this.showAlert('Erreur lors du chargement des utilisateurs', 'error');
        this.loading.set(false);
      }
    });
  }

  filterUsers() {
    const term = this.searchTerm.toLowerCase();
    const filtered = this.users().filter(user =>
      user.login.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
    this.filteredUsers.set(filtered);
  }

  saveUser() {
    if (!this.userForm.login || (!this.userForm.password && !this.editMode())) {
      this.showAlert('Veuillez remplir tous les champs requis', 'error');
      return;
    }

    const payload: any = {
      login: this.userForm.login,
      role: this.userForm.role
    };

    if (this.userForm.password) {
      payload.password = this.userForm.password;
    }

    if (this.editMode() && this.selectedUserId()) {
      // Update
      this.userService.updateUser(this.selectedUserId()!,payload).subscribe({
        next: () => {
          this.showAlert('Utilisateur modifié avec succès', 'success');
          this.loadUsers();
          this.resetForm();
        },
        error: (err) => {
          this.showAlert(err.error?.detail || 'Erreur lors de la modification', 'error');
        }
      });
    } else {
      // Create
      this.userService.createUser(payload).subscribe({
        next: () => {
          this.showAlert('Utilisateur créé avec succès', 'success');
          this.loadUsers();
          this.resetForm();
        },
        error: (err) => {
          this.showAlert(err.error?.detail || 'Erreur lors de la création', 'error');
        }
      });
    }
  }

  editUser(user: UserModel) {
    this.editMode.set(true);
    this.selectedUserId.set(user.id_user);
    this.userForm = {
      login: user.login,
      password: '',
      role: user.role
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteUser(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.showAlert('Utilisateur supprimé avec succès', 'success');
        this.loadUsers();
      },
      error: (err) => {
        this.showAlert(err.error?.detail || 'Erreur lors de la suppression', 'error');
      }
    });
  }

  cancelEdit() {
    this.resetForm();
  }

  resetForm() {
    this.editMode.set(false);
    this.selectedUserId.set(null);
    this.userForm = {
      login: '',
      password: '',
      role: 'user'
    };
  }

  showAlert(message: string, type: 'success' | 'error') {
    this.alertMessage.set(message);
    this.alertType.set(type);
    setTimeout(() => this.alertMessage.set(''), 5000);
  }
}
