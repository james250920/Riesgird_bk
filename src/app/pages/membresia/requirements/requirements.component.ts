import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MembershipService } from '../../../services';
import { MembershipRequirement } from '../../../models';
import { IconComponent } from '../../../shared/icons/icons.component';

@Component({
  selector: 'app-requirements',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './requirements.component.html',
  styleUrl: './requirements.component.scss'
})
export class RequirementsComponent {
  membershipService = inject(MembershipService);

  searchQuery = '';
  categoryFilter = 'all';
  typeFilter = 'all';

  showModal = signal(false);
  editingRequirement = signal<MembershipRequirement | null>(null);

  formData = {
    title: '',
    description: '',
    category: 'documentacion' as MembershipRequirement['category'],
    type: 'obligatorio' as MembershipRequirement['type'],
    documentFormat: '',
    maxFileSize: '',
    order: 1,
    isActive: true
  };

  requirements = this.membershipService.requirements;
  filteredRequirements = signal<MembershipRequirement[]>([]);

  obligatoriosCount = () => this.requirements().filter(r => r.type === 'obligatorio').length;
  opcionalesCount = () => this.requirements().filter(r => r.type === 'opcional').length;
  activeCount = () => this.requirements().filter(r => r.isActive).length;

  constructor() {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.requirements();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query)
      );
    }

    if (this.categoryFilter !== 'all') {
      result = result.filter(r => r.category === this.categoryFilter);
    }

    if (this.typeFilter !== 'all') {
      result = result.filter(r => r.type === this.typeFilter);
    }

    result = result.sort((a, b) => a.order - b.order);
    this.filteredRequirements.set(result);
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      documentacion: 'Documentación',
      institucional: 'Institucional',
      tecnico: 'Técnico',
      financiero: 'Financiero'
    };
    return labels[category] || category;
  }

  toggleActive(requirement: MembershipRequirement): void {
    this.membershipService.updateRequirement(requirement.id, {
      isActive: !requirement.isActive
    });
    this.applyFilters();
  }

  moveUp(requirement: MembershipRequirement): void {
    const filtered = this.filteredRequirements();
    const index = filtered.findIndex(r => r.id === requirement.id);
    if (index > 0) {
      const prev = filtered[index - 1];
      this.membershipService.updateRequirement(requirement.id, { order: prev.order });
      this.membershipService.updateRequirement(prev.id, { order: requirement.order });
      this.applyFilters();
    }
  }

  moveDown(requirement: MembershipRequirement): void {
    const filtered = this.filteredRequirements();
    const index = filtered.findIndex(r => r.id === requirement.id);
    if (index < filtered.length - 1) {
      const next = filtered[index + 1];
      this.membershipService.updateRequirement(requirement.id, { order: next.order });
      this.membershipService.updateRequirement(next.id, { order: requirement.order });
      this.applyFilters();
    }
  }

  openModal(): void {
    this.resetForm();
    this.formData.order = this.requirements().length + 1;
    this.showModal.set(true);
  }

  editRequirement(requirement: MembershipRequirement): void {
    this.editingRequirement.set(requirement);
    this.formData = {
      title: requirement.title,
      description: requirement.description,
      category: requirement.category,
      type: requirement.type,
      documentFormat: requirement.documentFormat || '',
      maxFileSize: requirement.maxFileSize || '',
      order: requirement.order,
      isActive: requirement.isActive
    };
    this.showModal.set(true);
  }

  deleteRequirement(requirement: MembershipRequirement): void {
    if (confirm(`¿Eliminar el requisito "${requirement.title}"?`)) {
      this.membershipService.deleteRequirement(requirement.id);
      this.applyFilters();
    }
  }

  saveRequirement(): void {
    if (!this.formData.title || !this.formData.description) return;

    if (this.editingRequirement()) {
      this.membershipService.updateRequirement(this.editingRequirement()!.id, {
        title: this.formData.title,
        description: this.formData.description,
        category: this.formData.category,
        type: this.formData.type,
        documentFormat: this.formData.documentFormat || undefined,
        maxFileSize: this.formData.maxFileSize || undefined,
        order: this.formData.order,
        isActive: this.formData.isActive,
        updatedAt: new Date()
      });
    } else {
      const newRequirement: MembershipRequirement = {
        id: crypto.randomUUID(),
        title: this.formData.title,
        description: this.formData.description,
        category: this.formData.category,
        type: this.formData.type,
        documentFormat: this.formData.documentFormat || undefined,
        maxFileSize: this.formData.maxFileSize || undefined,
        order: this.formData.order,
        isRequired: this.formData.type === 'obligatorio',
        isActive: this.formData.isActive,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.membershipService.addRequirement(newRequirement);
    }

    this.closeModal();
    this.applyFilters();
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingRequirement.set(null);
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      title: '',
      description: '',
      category: 'documentacion',
      type: 'obligatorio',
      documentFormat: '',
      maxFileSize: '',
      order: 1,
      isActive: true
    };
  }
}
