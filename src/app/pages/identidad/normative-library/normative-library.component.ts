import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InstitutionalService } from '../../../services';
import { NormativeDocument } from '../../../models';
import { IconComponent } from '../../../shared';

@Component({
  selector: 'app-normative-library',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './normative-library.component.html',
  styleUrl: './normative-library.component.scss'
})
export class NormativeLibraryComponent {
  institutionalService = inject(InstitutionalService);

  selectedCategory = signal<string>('all');
  showUploadModal = signal(false);
  editingDocument = signal<NormativeDocument | null>(null);
  selectedFile = signal<File | null>(null);

  formData = {
    name: '',
    type: 'estatuto' as NormativeDocument['type'],
    description: '',
    validFrom: '',
    validTo: '',
    isPublic: true,
    isActive: true
  };

  filteredDocuments() {
    const docs = this.institutionalService.documents();
    if (this.selectedCategory() === 'all') return docs;
    return docs.filter(d => d.type === this.selectedCategory());
  }

  getDocIcon(type: string): string {
    const icons: Record<string, string> = {
      'estatuto': 'file-text',
      'plan_trabajo': 'clipboard-list',
      'reglamento': 'book',
      'otro': 'file'
    };
    return icons[type] || 'file';
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  openUploadModal(): void {
    this.resetForm();
    this.showUploadModal.set(true);
  }

  editDocument(doc: NormativeDocument): void {
    this.editingDocument.set(doc);
    this.formData = {
      name: doc.name,
      type: doc.type,
      description: doc.description,
      validFrom: doc.validFrom ? new Date(doc.validFrom).toISOString().split('T')[0] : '',
      validTo: doc.validTo ? new Date(doc.validTo).toISOString().split('T')[0] : '',
      isPublic: doc.isPublic,
      isActive: doc.isActive
    };
    this.showUploadModal.set(true);
  }

  replaceDocument(doc: NormativeDocument): void {
    // Implementar lógica de reemplazo
    this.editDocument(doc);
  }

  deleteDocument(doc: NormativeDocument): void {
    if (confirm(`¿Está seguro de eliminar "${doc.name}"?`)) {
      this.institutionalService.deleteDocument(doc.id);
    }
  }

  downloadDocument(doc: NormativeDocument): void {
    // Simular descarga
    window.open(doc.fileUrl, '_blank');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile.set(input.files[0]);
    }
  }

  saveDocument(): void {
    if (this.editingDocument()) {
      this.institutionalService.updateDocument(this.editingDocument()!.id, {
        name: this.formData.name,
        type: this.formData.type,
        description: this.formData.description,
        validFrom: this.formData.validFrom ? new Date(this.formData.validFrom) : new Date(),
        validTo: this.formData.validTo ? new Date(this.formData.validTo) : undefined,
        isPublic: this.formData.isPublic,
        isActive: this.formData.isActive
      });
    } else {
      const newDoc: NormativeDocument = {
        id: crypto.randomUUID(),
        name: this.formData.name,
        type: this.formData.type,
        description: this.formData.description,
        fileUrl: '/documents/' + this.selectedFile()?.name,
        fileName: this.selectedFile()?.name || '',
        fileSize: this.selectedFile()?.size || 0,
        uploadDate: new Date(),
        validFrom: this.formData.validFrom ? new Date(this.formData.validFrom) : new Date(),
        validTo: this.formData.validTo ? new Date(this.formData.validTo) : undefined,
        isActive: this.formData.isActive,
        isPublic: this.formData.isPublic,
        uploadedBy: 'admin'
      };
      this.institutionalService.addDocument(newDoc);
    }
    this.closeModals();
  }

  closeModals(): void {
    this.showUploadModal.set(false);
    this.editingDocument.set(null);
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      name: '',
      type: 'estatuto',
      description: '',
      validFrom: '',
      validTo: '',
      isPublic: true,
      isActive: true
    };
    this.selectedFile.set(null);
  }
}
