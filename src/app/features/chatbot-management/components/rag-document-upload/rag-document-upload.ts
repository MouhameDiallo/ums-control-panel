import {Component, EventEmitter, Output} from '@angular/core';
import {HttpClient, HttpEvent, HttpEventType} from '@angular/common/http';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';

interface UploadResponse {
  success: boolean;
  message: string;
  file_id?: string;
  filename?: string;
  pages?: number;
  chunks?: number;
}

interface UploadedDocument {
  id: string;
  filename: string;
  upload_date: Date;
  size: number;
  pages?: number;
  status: 'processing' | 'ready' | 'error';
}

@Component({
  selector: 'app-rag-document-upload',
  imports: [
    NgIf,
    NgClass,
    FormsModule,
    NgForOf
  ],
  standalone: true,
  templateUrl: './rag-document-upload.html',
  styleUrl: './rag-document-upload.scss'
})
export class RagDocumentUpload {
  @Output() onUploadSuccess = new EventEmitter<UploadResponse>();
  @Output() onUploadError = new EventEmitter<string>();

  private apiUrl = 'http://localhost:8000/api/v1/chatbot'; // À adapter selon votre API

  selectedFile: File | null = null;
  uploadProgress = 0;
  isUploading = false;
  uploadComplete = false;
  errorMessage = '';
  successMessage = '';

  // Métadonnées optionnelles
  documentTitle = '';
  documentDescription = '';
  documentTags: string[] = [];
  currentTag = '';

  // Liste des documents uploadés
  uploadedDocuments: UploadedDocument[] = [];
  showDocumentList = false;

  // Drag & Drop
  isDragging = false;

  constructor(private http: HttpClient) {
    this.loadUploadedDocuments();
  }

  // Gestion de la sélection de fichier
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectFile(input.files[0]);
    }
  }

  selectFile(file: File): void {
    // Vérifier que c'est bien un PDF
    if (file.type !== 'application/pdf') {
      this.errorMessage = 'Seuls les fichiers PDF sont acceptés.';
      this.selectedFile = null;
      return;
    }

    // Vérifier la taille (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      this.errorMessage = 'Le fichier est trop volumineux. Taille maximale : 50MB.';
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';
    this.successMessage = '';
    this.uploadComplete = false;

    // Auto-remplir le titre si vide
    if (!this.documentTitle) {
      this.documentTitle = file.name.replace('.pdf', '');
    }
  }

  // Drag & Drop handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectFile(event.dataTransfer.files[0]);
    }
  }

  // Gestion des tags
  addTag(): void {
    if (this.currentTag.trim() && !this.documentTags.includes(this.currentTag.trim())) {
      this.documentTags.push(this.currentTag.trim());
      this.currentTag = '';
    }
  }

  removeTag(tag: string): void {
    this.documentTags = this.documentTags.filter(t => t !== tag);
  }

  // Upload du fichier
  async uploadFile(): Promise<void> {
    if (!this.selectedFile) {
      this.errorMessage = 'Veuillez sélectionner un fichier PDF.';
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('title', this.documentTitle || this.selectedFile.name);
    formData.append('description', this.documentDescription);
    formData.append('tags', JSON.stringify(this.documentTags));

    try {
      this.http.post<UploadResponse>(`${this.apiUrl}/upload-document`, formData, {
        reportProgress: true,
        observe: 'events'
      }).subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress) {
            if (event.total) {
              this.uploadProgress = Math.round((100 * event.loaded) / event.total);
            }
          } else if (event.type === HttpEventType.Response) {
            const response = event.body as UploadResponse;
            this.handleUploadSuccess(response);
          }
        },
        error: (error) => {
          this.handleUploadError(error);
        }
      });
    } catch (error) {
      this.handleUploadError(error);
    }
  }

  private handleUploadSuccess(response: UploadResponse): void {
    this.isUploading = false;
    this.uploadComplete = true;
    this.successMessage = response.message || 'Document uploadé avec succès !';

    if (response.pages) {
      this.successMessage += ` (${response.pages} pages analysées)`;
    }

    this.onUploadSuccess.emit(response);

    // Réinitialiser le formulaire après 2 secondes
    setTimeout(() => {
      this.resetForm();
      this.loadUploadedDocuments();
    }, 2000);
  }

  private handleUploadError(error: any): void {
    this.isUploading = false;
    this.uploadComplete = false;

    if (error.error?.detail) {
      this.errorMessage = error.error.detail;
    } else if (error.message) {
      this.errorMessage = error.message;
    } else {
      this.errorMessage = 'Une erreur est survenue lors de l\'upload du document.';
    }

    this.onUploadError.emit(this.errorMessage);
  }

  // Charger la liste des documents uploadés
  async loadUploadedDocuments(): Promise<void> {
    try {
      this.http.get<UploadedDocument[]>(`${this.apiUrl}/documents`).subscribe({
        next: (documents) => {
          this.uploadedDocuments = documents;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des documents:', error);
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
    }
  }

  // Supprimer un document
  async deleteDocument(docId: string): Promise<void> {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return;
    }

    try {
      this.http.delete(`${this.apiUrl}/documents/${docId}`).subscribe({
        next: () => {
          this.uploadedDocuments = this.uploadedDocuments.filter(doc => doc.id !== docId);
          this.successMessage = 'Document supprimé avec succès.';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la suppression du document.';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
    } catch (error) {
      this.errorMessage = 'Erreur lors de la suppression du document.';
      setTimeout(() => this.errorMessage = '', 3000);
    }
  }

  // Réinitialiser le formulaire
  resetForm(): void {
    this.selectedFile = null;
    this.documentTitle = '';
    this.documentDescription = '';
    this.documentTags = [];
    this.currentTag = '';
    this.uploadProgress = 0;
    this.uploadComplete = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Utilitaires
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusBadge(status: string): string {
    const badges: { [key: string]: string } = {
      'processing': 'bg-yellow-100 text-yellow-800',
      'ready': 'bg-green-100 text-green-800',
      'error': 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'processing': 'En traitement',
      'ready': 'Prêt',
      'error': 'Erreur'
    };
    return labels[status] || status;
  }

  toggleDocumentList(): void {
    this.showDocumentList = !this.showDocumentList;
  }

}
