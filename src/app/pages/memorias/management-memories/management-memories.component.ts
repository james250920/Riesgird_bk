import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MemoriesService } from '../../../services';
import { ManagementMemory } from '../../../models';
import { IconComponent } from '../../../shared/icons/icons.component';

@Component({
  selector: 'app-management-memories',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './management-memories.component.html',
  styleUrl: './management-memories.component.scss'
})
export class ManagementMemoriesComponent {
  memoriesService = inject(MemoriesService);

  searchQuery = '';
  yearFilter = 'all';
  typeFilter = 'all';
  statusFilter = 'all';

  showModal = signal(false);
  editingMemory = signal<ManagementMemory | null>(null);

  formData = {
    title: '',
    year: new Date().getFullYear(),
    type: 'anual' as ManagementMemory['type'],
    period: '',
    status: 'borrador' as ManagementMemory['status'],
    description: '',
    president: '',
    pageCount: 0,
    publishedDate: '',
    highlights: [] as string[],
    documentUrl: '',
    digitalBookUrl: '',
    coverImageUrl: '',
    isPublic: false
  };

  memories = this.memoriesService.memories;
  filteredMemories = signal<ManagementMemory[]>([]);

  publishedMemories = () => this.memories().filter(m => m.status === 'publicada').length;
  publicMemories = () => this.memories().filter(m => m.isPublic).length;

  yearsSpan = computed(() => {
    const years = this.memories().map(m => m.year);
    if (!years.length) return 0;
    return Math.max(...years) - Math.min(...years) + 1;
  });

  availableYears = computed(() => {
    const years = [...new Set(this.memories().map(m => m.year))];
    return years.sort((a, b) => b - a);
  });

  constructor() {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.memories();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(m => m.title.toLowerCase().includes(query));
    }

    if (this.yearFilter !== 'all') {
      result = result.filter(m => m.year.toString() === this.yearFilter);
    }

    if (this.typeFilter !== 'all') {
      result = result.filter(m => m.type === this.typeFilter);
    }

    if (this.statusFilter !== 'all') {
      result = result.filter(m => m.status === this.statusFilter);
    }

    this.filteredMemories.set(result.sort((a, b) => b.year - a.year));
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      anual: 'Anual',
      semestral: 'Semestral',
      especial: 'Especial'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      borrador: 'Borrador',
      revision: 'En revisión',
      publicada: 'Publicada'
    };
    return labels[status] || status;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  toggleVisibility(memory: ManagementMemory): void {
    this.memoriesService.updateMemory(memory.id, { isPublic: !memory.isPublic });
    this.applyFilters();
  }

  addHighlight(event: Event): void {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    if (input.value.trim()) {
      this.formData.highlights.push(input.value.trim());
      input.value = '';
    }
  }

  removeHighlight(index: number): void {
    this.formData.highlights.splice(index, 1);
  }

  openModal(): void {
    this.resetForm();
    this.showModal.set(true);
  }

  editMemory(memory: ManagementMemory): void {
    this.editingMemory.set(memory);
    this.formData = {
      title: memory.title,
      year: memory.year,
      type: memory.type,
      period: memory.period || '',
      status: memory.status,
      description: memory.description || '',
      president: memory.president || '',
      pageCount: memory.pageCount || 0,
      publishedDate: memory.publishedDate ? new Date(memory.publishedDate).toISOString().split('T')[0] : '',
      highlights: [...(memory.highlights || [])],
      documentUrl: memory.documentUrl || '',
      digitalBookUrl: memory.digitalBookUrl || '',
      coverImageUrl: memory.coverImageUrl || '',
      isPublic: memory.isPublic
    };
    this.showModal.set(true);
  }

  deleteMemory(memory: ManagementMemory): void {
    if (confirm(`¿Eliminar "${memory.title}"?`)) {
      this.memoriesService.deleteMemory(memory.id);
      this.applyFilters();
    }
  }

  saveMemory(): void {
    if (!this.formData.title) return;

    if (this.editingMemory()) {
      this.memoriesService.updateMemory(this.editingMemory()!.id, {
        ...this.formData,
        publishedDate: this.formData.publishedDate ? new Date(this.formData.publishedDate) : undefined,
        updatedAt: new Date()
      });
    } else {
      const newMemory: ManagementMemory = {
        id: crypto.randomUUID(),
        ...this.formData,
        publishedDate: this.formData.publishedDate ? new Date(this.formData.publishedDate) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin'
      };
      this.memoriesService.addMemory(newMemory);
    }

    this.closeModal();
    this.applyFilters();
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingMemory.set(null);
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      title: '',
      year: new Date().getFullYear(),
      type: 'anual',
      period: '',
      status: 'borrador',
      description: '',
      president: '',
      pageCount: 0,
      publishedDate: '',
      highlights: [],
      documentUrl: '',
      digitalBookUrl: '',
      coverImageUrl: '',
      isPublic: false
    };
  }
}
