import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InstitutionalService } from '../../../services';
import { Ally } from '../../../models';
import { IconComponent } from '../../../shared';

@Component({
  selector: 'app-allies-directory',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './allies-directory.component.html',
  styleUrl: './allies-directory.component.scss'
})
export class AlliesDirectoryComponent {
  institutionalService = inject(InstitutionalService);

  filterType = signal<string>('all');
  showModal = signal(false);
  editingAlly = signal<Ally | null>(null);
  previewLogo = signal<string>('');

  formData = {
    name: '',
    type: 'cooperacion_internacional' as Ally['type'],
    description: '',
    websiteUrl: '',
    contactEmail: '',
    contactPhone: '',
    isPublic: true,
    isActive: true
  };

  filteredAllies() {
    const allies = this.institutionalService.allies();
    if (this.filterType() === 'all') return allies;
    return allies.filter(a => a.type === this.filterType());
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'cooperacion_internacional': 'Cooperación Internacional',
      'gobierno': 'Gobierno',
      'colegio_profesional': 'Colegio Profesional',
      'institucion_privada': 'Institución Privada',
      'otro': 'Otro'
    };
    return labels[type] || type;
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }

  openModal(): void {
    this.resetForm();
    this.showModal.set(true);
  }

  editAlly(ally: Ally): void {
    this.editingAlly.set(ally);
    this.formData = {
      name: ally.name,
      type: ally.type,
      description: ally.description || '',
      websiteUrl: ally.websiteUrl || '',
      contactEmail: ally.contactEmail || '',
      contactPhone: ally.contactPhone || '',
      isPublic: ally.isPublic,
      isActive: ally.isActive
    };
    this.previewLogo.set(ally.logoUrl || '');
    this.showModal.set(true);
  }

  toggleVisibility(ally: Ally): void {
    this.institutionalService.updateAlly(ally.id, {
      isPublic: !ally.isPublic
    });
  }

  deleteAlly(ally: Ally): void {
    if (confirm(`¿Está seguro de eliminar "${ally.name}"?`)) {
      this.institutionalService.deleteAlly(ally.id);
    }
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.previewLogo.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  saveAlly(): void {
    if (this.editingAlly()) {
      this.institutionalService.updateAlly(this.editingAlly()!.id, {
        name: this.formData.name,
        type: this.formData.type,
        description: this.formData.description,
        websiteUrl: this.formData.websiteUrl,
        contactEmail: this.formData.contactEmail,
        contactPhone: this.formData.contactPhone,
        logoUrl: this.previewLogo(),
        isPublic: this.formData.isPublic,
        isActive: this.formData.isActive
      });
    } else {
      const newAlly: Ally = {
        id: crypto.randomUUID(),
        name: this.formData.name,
        type: this.formData.type,
        description: this.formData.description,
        websiteUrl: this.formData.websiteUrl,
        contactEmail: this.formData.contactEmail,
        contactPhone: this.formData.contactPhone,
        logoUrl: this.previewLogo(),
        isPublic: this.formData.isPublic,
        isActive: this.formData.isActive,
        order: this.institutionalService.allies().length,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.institutionalService.addAlly(newAlly);
    }
    this.closeModal();
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingAlly.set(null);
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      name: '',
      type: 'cooperacion_internacional',
      description: '',
      websiteUrl: '',
      contactEmail: '',
      contactPhone: '',
      isPublic: true,
      isActive: true
    };
    this.previewLogo.set('');
  }
}
