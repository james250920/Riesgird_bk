import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/icons/icons.component';
import { WebAdminService, WebResource } from '../../../services';

@Component({
  selector: 'app-web-resources',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.scss'
})
export class ResourcesComponent {
  private webAdminService = inject(WebAdminService);

  resources = this.webAdminService.resources;
  showModal = signal(false);
  editingResource = signal<WebResource | null>(null);

  formData = {
    title: '',
    type: 'documento' as WebResource['type'],
    url: '',
    description: '',
    isPublic: true
  };

  openModal(): void {
    this.editingResource.set(null);
    this.resetForm();
    this.showModal.set(true);
  }

  editResource(resource: WebResource): void {
    this.editingResource.set(resource);
    this.formData = {
      title: resource.title,
      type: resource.type,
      url: resource.url,
      description: resource.description ?? '',
      isPublic: resource.isPublic
    };
    this.showModal.set(true);
  }

  saveResource(): void {
    if (!this.formData.title || !this.formData.url) return;

    if (this.editingResource()) {
      this.webAdminService.updateResource(this.editingResource()!.id, this.formData);
    } else {
      this.webAdminService.addResource(this.formData);
    }

    this.closeModal();
  }

  deleteResource(resource: WebResource): void {
    if (confirm(`¿Eliminar recurso "${resource.title}"?`)) {
      this.webAdminService.deleteResource(resource.id);
    }
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingResource.set(null);
  }

  private resetForm(): void {
    this.formData = {
      title: '',
      type: 'documento',
      url: '',
      description: '',
      isPublic: true
    };
  }
}
