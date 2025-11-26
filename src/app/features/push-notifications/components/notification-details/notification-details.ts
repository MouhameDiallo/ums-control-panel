import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NotificationWithTargets} from '../../../../core/models/notification.model';
import {DatePipe, NgForOf, NgIf} from '@angular/common';

export interface CibleResponse {
  id_cible: number;
  type: string;
  identifiant?: string;
  code?: string;
  matricule?: string;
  numero?: string;
  nombre_membres?: number;
  token?: string;
}

@Component({
  selector: 'app-notification-details',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    NgIf,
    NgForOf
  ],
  standalone: true,
  templateUrl: './notification-details.html',
  styleUrl: './notification-details.scss'
})
export class NotificationDetails implements OnInit {
  @Input() notification!: NotificationWithTargets;
  @Output() onSave = new EventEmitter<Partial<NotificationWithTargets>>();
  @Output() onCancel = new EventEmitter<void>();

  notificationForm!: FormGroup;
  isEditing = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.notificationForm = this.fb.group({
      titre: [this.notification.titre, [Validators.required, Validators.maxLength(200)]],
      message: [this.notification.message, [Validators.required]],
      media_url: [this.notification.media_url || '']
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.notificationForm.patchValue({
        titre: this.notification.titre,
        message: this.notification.message,
        media_url: this.notification.media_url || ''
      });
    }
  }

  save(): void {
    if (this.notificationForm.valid) {
      const updatedData = {
        id_notification: this.notification.id_notification,
        titre: this.notificationForm.value.titre,
        message: this.notificationForm.value.message,
        media_url: this.notificationForm.value.media_url || null
      };
      this.onSave.emit(updatedData);
      this.isEditing = false;
    }
  }

  cancel(): void {
    this.toggleEdit();
  }

  getCibleLabel(cible: CibleResponse): string {
    switch (cible.type) {
      case 'code':
        return cible.code || cible.identifiant || '';
      case 'matricule':
        return cible.matricule || cible.identifiant || '';
      case 'numero':
        return cible.numero || cible.identifiant || '';
      default:
        return cible.identifiant || '';
    }
  }

  getCibleIcon(type: string): string {
    const icons: { [key: string]: string } = {
      code: '🔢',
      etudiant: '👨🏾‍🎓👩🏾‍🎓',
      personnel: '👨🏾‍💼👩🏾‍💼',
      groupe: '👥'
    };
    return icons[type] || '📋';
  }
}
