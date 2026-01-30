import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KnowledgeService, UniversityService } from '../../../services';
import { UniversityBrigade } from '../../../models';
import { IconComponent } from '../../../shared/icons/icons.component';

@Component({
  selector: 'app-brigades',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './brigades.component.html',
  styleUrl: './brigades.component.scss'
})
export class BrigadesComponent {
  knowledgeService = inject(KnowledgeService);
  universityService = inject(UniversityService);

  searchQuery = '';
  universityFilter = 'all';
  typeFilter = 'all';
  statusFilter = 'all';

  showModal = signal(false);
  editingBrigade = signal<UniversityBrigade | null>(null);

  formData = {
    name: '',
    universityId: '',
    type: 'emergencias' as UniversityBrigade['type'],
    description: '',
    coordinator: '',
    contactEmail: '',
    membersCount: 0,
    foundedDate: '',
    certifications: [] as string[],
    status: 'activa' as UniversityBrigade['status'],
    logoUrl: '',
    isPublic: false
  };

  brigades = this.knowledgeService.brigades;
  universities = this.universityService.universities;
  filteredBrigades = signal<UniversityBrigade[]>([]);

  activeBrigades = () => this.brigades().filter(b => b.status === 'activa').length;
  totalMembers = () => this.brigades().reduce((sum, b) => sum + (b.membersCount || 0), 0);
  universitiesWithBrigades = computed(() => new Set(this.brigades().map(b => b.universityId)).size);

  constructor() {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.brigades();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(b => b.name.toLowerCase().includes(query));
    }

    if (this.universityFilter !== 'all') {
      result = result.filter(b => b.universityId === this.universityFilter);
    }

    if (this.typeFilter !== 'all') {
      result = result.filter(b => b.type === this.typeFilter);
    }

    if (this.statusFilter !== 'all') {
      result = result.filter(b => b.status === this.statusFilter);
    }

    this.filteredBrigades.set(result);
  }

  getBrigadeTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      emergencias: 'alert-circle',
      primeros_auxilios: 'heart',
      evacuacion: 'log-out',
      comunicaciones: 'send',
      logistica: 'archive'
    };
    return icons[type] || 'shield';
  }

  getBrigadeTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      emergencias: 'Emergencias',
      primeros_auxilios: 'Primeros Auxilios',
      evacuacion: 'Evacuación',
      comunicaciones: 'Comunicaciones',
      logistica: 'Logística'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      activa: 'Activa',
      en_formacion: 'En formación',
      inactiva: 'Inactiva'
    };
    return labels[status] || status;
  }

  getUniversityName(id: string): string {
    const uni = this.universities().find(u => u.id === id);
    return uni?.shortName || 'Sin universidad';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-PE', { month: 'short', year: 'numeric' });
  }

  toggleVisibility(brigade: UniversityBrigade): void {
    this.knowledgeService.updateBrigade(brigade.id, { isPublic: !brigade.isPublic });
    this.applyFilters();
  }

  viewMembers(brigade: UniversityBrigade): void {
    alert(`Ver miembros de: ${brigade.name}`);
  }

  openModal(): void {
    this.resetForm();
    this.showModal.set(true);
  }

  editBrigade(brigade: UniversityBrigade): void {
    this.editingBrigade.set(brigade);
    this.formData = {
      name: brigade.name,
      universityId: brigade.universityId,
      type: brigade.type,
      description: brigade.description || '',
      coordinator: brigade.coordinator || '',
      contactEmail: brigade.contactEmail || '',
      membersCount: brigade.membersCount || 0,
      foundedDate: brigade.foundedDate ? new Date(brigade.foundedDate).toISOString().split('T')[0] : '',
      certifications: [...(brigade.certifications || [])],
      status: brigade.status,
      logoUrl: brigade.logoUrl || '',
      isPublic: brigade.isPublic
    };
    this.showModal.set(true);
  }

  deleteBrigade(brigade: UniversityBrigade): void {
    if (confirm(`¿Eliminar "${brigade.name}"?`)) {
      this.knowledgeService.deleteBrigade(brigade.id);
      this.applyFilters();
    }
  }

  addCertification(event: Event): void {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    if (input.value.trim() && !this.formData.certifications.includes(input.value.trim())) {
      this.formData.certifications.push(input.value.trim());
      input.value = '';
    }
  }

  removeCertification(index: number): void {
    this.formData.certifications.splice(index, 1);
  }

  saveBrigade(): void {
    if (!this.formData.name || !this.formData.universityId) return;

    if (this.editingBrigade()) {
      this.knowledgeService.updateBrigade(this.editingBrigade()!.id, {
        ...this.formData,
        foundedDate: this.formData.foundedDate ? new Date(this.formData.foundedDate) : undefined,
        updatedAt: new Date()
      });
    } else {
      const newBrigade: UniversityBrigade = {
        id: crypto.randomUUID(),
        ...this.formData,
        foundedDate: this.formData.foundedDate ? new Date(this.formData.foundedDate) : undefined,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.knowledgeService.addBrigade(newBrigade);
    }

    this.closeModal();
    this.applyFilters();
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingBrigade.set(null);
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      name: '',
      universityId: '',
      type: 'emergencias',
      description: '',
      coordinator: '',
      contactEmail: '',
      membersCount: 0,
      foundedDate: '',
      certifications: [],
      status: 'activa',
      logoUrl: '',
      isPublic: false
    };
  }
}
