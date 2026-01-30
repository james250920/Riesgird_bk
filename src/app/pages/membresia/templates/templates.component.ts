import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MembershipService } from '../../../services';
import { DownloadableTemplate } from '../../../models';
import { IconComponent } from '../../../shared/icons/icons.component';

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './templates.component.html',
  styleUrl: './templates.component.scss'
})
export class TemplatesComponent {
  membershipService = inject(MembershipService);

  searchQuery = '';
  categoryFilter = 'all';
  formatFilter = 'all';

  showModal = signal(false);
  editingTemplate = signal<DownloadableTemplate | null>(null);

  formData = {
    name: '',
    description: '',
    category: 'membresia' as DownloadableTemplate['category'],
    format: 'PDF' as DownloadableTemplate['format'],
    fileUrl: '',
    fileSize: '',
    version: '',
    isPublic: true,
    isActive: true
  };

  templates = this.membershipService.templates;
  filteredTemplates = signal<DownloadableTemplate[]>([]);

  totalDownloads = () => this.templates().reduce((sum, t) => sum + (t.downloadCount || 0), 0);
  publicTemplates = () => this.templates().filter(t => t.isPublic).length;
  activeTemplates = () => this.templates().filter(t => t.isActive).length;

  constructor() {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.templates();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
      );
    }

    if (this.categoryFilter !== 'all') {
      result = result.filter(t => t.category === this.categoryFilter);
    }

    if (this.formatFilter !== 'all') {
      result = result.filter(t => t.format === this.formatFilter);
    }

    this.filteredTemplates.set(result);
  }

  getFormatIcon(format: string): string {
    const icons: Record<string, string> = {
      PDF: 'file-text',
      DOCX: 'file-text',
      XLSX: 'file-spreadsheet',
      PPTX: 'file-presentation'
    };
    return icons[format] || 'file-text';
  }

  getFormatClass(format: string): string {
    return format.toLowerCase();
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      membresia: 'Membresía',
      informes: 'Informes',
      solicitudes: 'Solicitudes',
      otros: 'Otros'
    };
    return labels[category] || category;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  togglePublic(template: DownloadableTemplate): void {
    this.membershipService.updateTemplate(template.id, {
      isPublic: !template.isPublic
    });
    this.applyFilters();
  }

  openModal(): void {
    this.resetForm();
    this.showModal.set(true);
  }

  editTemplate(template: DownloadableTemplate): void {
    this.editingTemplate.set(template);
    this.formData = {
      name: template.name,
      description: template.description || '',
      category: template.category,
      format: template.format,
      fileUrl: template.fileUrl || '',
      fileSize: template.fileSize || '',
      version: template.version || '',
      isPublic: template.isPublic,
      isActive: template.isActive
    };
    this.showModal.set(true);
  }

  deleteTemplate(template: DownloadableTemplate): void {
    if (confirm(`¿Eliminar la plantilla "${template.name}"?`)) {
      this.membershipService.deleteTemplate(template.id);
      this.applyFilters();
    }
  }

  saveTemplate(): void {
    if (!this.formData.name || !this.formData.fileUrl) return;

    if (this.editingTemplate()) {
      this.membershipService.updateTemplate(this.editingTemplate()!.id, {
        name: this.formData.name,
        description: this.formData.description || undefined,
        category: this.formData.category,
        format: this.formData.format,
        fileUrl: this.formData.fileUrl || undefined,
        fileSize: this.formData.fileSize || undefined,
        version: this.formData.version || undefined,
        isPublic: this.formData.isPublic,
        isActive: this.formData.isActive,
        updatedAt: new Date()
      });
    } else {
      const newTemplate: DownloadableTemplate = {
        id: crypto.randomUUID(),
        name: this.formData.name,
        description: this.formData.description || undefined,
        category: this.formData.category,
        format: this.formData.format,
        fileUrl: this.formData.fileUrl || undefined,
        fileSize: this.formData.fileSize || undefined,
        version: this.formData.version || undefined,
        downloadCount: 0,
        isPublic: this.formData.isPublic,
        isActive: this.formData.isActive,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.membershipService.addTemplate(newTemplate);
    }

    this.closeModal();
    this.applyFilters();
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingTemplate.set(null);
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      name: '',
      description: '',
      category: 'membresia',
      format: 'PDF',
      fileUrl: '',
      fileSize: '',
      version: '',
      isPublic: true,
      isActive: true
    };
  }
}
