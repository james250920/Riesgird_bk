import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GovernanceService } from '../../../services';
import { Assembly } from '../../../models';
import { IconComponent } from '../../../shared/icons/icons.component';

@Component({
  selector: 'app-assemblies',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './assemblies.component.html',
  styleUrl: './assemblies.component.scss'
})
export class AssembliesComponent {
  governanceService = inject(GovernanceService);

  searchQuery = '';
  typeFilter = 'all';
  statusFilter = 'all';
  yearFilter = 'all';

  showModal = signal(false);
  editingAssembly = signal<Assembly | null>(null);

  formData = {
    number: '',
    type: 'ordinaria' as Assembly['type'],
    title: '',
    description: '',
    date: '',
    modality: 'presencial' as Assembly['modality'],
    location: '',
    virtualLink: '',
    convocationUrl: '',
    minutesUrl: '',
    status: 'programada' as Assembly['status'],
    attendeesCount: 0,
    isPublic: false
  };

  assemblies = this.governanceService.assemblies;
  filteredAssemblies = signal<Assembly[]>([]);

  availableYears = computed(() => {
    const years = new Set(this.assemblies().map(a => new Date(a.date).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  });

  completedAssemblies = () => this.assemblies().filter(a => a.status === 'finalizada' || a.status === 'completada').length;
  scheduledAssemblies = () => this.assemblies().filter(a => a.status === 'programada').length;
  totalAgreements = () => this.assemblies().reduce((sum, a) => sum + (a.agreements?.length || 0), 0);

  constructor() {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.assemblies();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(query) ||
        String(a.number).toLowerCase().includes(query)
      );
    }

    if (this.typeFilter !== 'all') {
      result = result.filter(a => a.type === this.typeFilter);
    }

    if (this.statusFilter !== 'all') {
      result = result.filter(a => a.status === this.statusFilter);
    }

    if (this.yearFilter !== 'all') {
      result = result.filter(a => new Date(a.date).getFullYear() === parseInt(this.yearFilter));
    }

    result = result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.filteredAssemblies.set(result);
  }

  getDay(date: Date): number {
    return new Date(date).getDate();
  }

  getMonth(date: Date): string {
    return new Date(date).toLocaleDateString('es-PE', { month: 'short' });
  }

  getYear(date: Date): number {
    return new Date(date).getFullYear();
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      programada: 'Programada',
      en_curso: 'En curso',
      completada: 'Completada',
      cancelada: 'Cancelada'
    };
    return labels[status] || status;
  }

  getModalityLabel(modality: string): string {
    const labels: Record<string, string> = {
      presencial: 'Presencial',
      virtual: 'Virtual',
      hibrida: 'Híbrida'
    };
    return labels[modality] || modality;
  }

  toggleVisibility(assembly: Assembly): void {
    this.governanceService.updateAssembly(assembly.id, { isPublic: !assembly.isPublic });
    this.applyFilters();
  }

  viewDetails(assembly: Assembly): void {
    alert(`Ver detalles de: ${assembly.title}`);
  }

  openModal(): void {
    this.resetForm();
    this.showModal.set(true);
  }

  editAssembly(assembly: Assembly): void {
    this.editingAssembly.set(assembly);
    const date = new Date(assembly.date);
    this.formData = {
      number: String(assembly.number),
      type: assembly.type,
      title: assembly.title,
      description: assembly.description || '',
      date: date.toISOString().slice(0, 16),
      modality: assembly.modality || 'presencial',
      location: assembly.location,
      virtualLink: assembly.virtualLink || '',
      convocationUrl: assembly.convocationUrl || '',
      minutesUrl: assembly.minutesUrl || '',
      status: assembly.status,
      attendeesCount: assembly.attendeesCount || 0,
      isPublic: assembly.isPublic
    };
    this.showModal.set(true);
  }

  deleteAssembly(assembly: Assembly): void {
    if (confirm(`¿Eliminar la asamblea "${assembly.title}"?`)) {
      this.governanceService.deleteAssembly(assembly.id);
      this.applyFilters();
    }
  }

  saveAssembly(): void {
    if (!this.formData.title || !this.formData.date) return;

    if (this.editingAssembly()) {
      this.governanceService.updateAssembly(this.editingAssembly()!.id, {
        number: parseInt(this.formData.number) || 1,
        type: this.formData.type,
        title: this.formData.title,
        description: this.formData.description || undefined,
        date: new Date(this.formData.date),
        modality: this.formData.modality,
        location: this.formData.location,
        virtualLink: this.formData.virtualLink || undefined,
        convocationUrl: this.formData.convocationUrl || undefined,
        minutesUrl: this.formData.minutesUrl || undefined,
        status: this.formData.status,
        attendeesCount: this.formData.attendeesCount || undefined,
        isPublic: this.formData.isPublic,
        updatedAt: new Date()
      });
    } else {
      const newAssembly: Assembly = {
        id: crypto.randomUUID(),
        year: new Date(this.formData.date).getFullYear(),
        number: parseInt(this.formData.number) || 1,
        type: this.formData.type,
        title: this.formData.title,
        description: this.formData.description || undefined,
        date: new Date(this.formData.date),
        modality: this.formData.modality,
        location: this.formData.location,
        virtualLink: this.formData.virtualLink || undefined,
        convocationUrl: this.formData.convocationUrl || undefined,
        minutesUrl: this.formData.minutesUrl || undefined,
        status: this.formData.status,
        attendeesCount: this.formData.attendeesCount || undefined,
        agendaItems: [],
        agreements: [],
        photos: [],
        isPublic: this.formData.isPublic,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin'
      };
      this.governanceService.addAssembly(newAssembly);
    }

    this.closeModal();
    this.applyFilters();
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingAssembly.set(null);
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      number: '',
      type: 'ordinaria',
      title: '',
      description: '',
      date: '',
      modality: 'presencial',
      location: '',
      virtualLink: '',
      convocationUrl: '',
      minutesUrl: '',
      status: 'programada',
      attendeesCount: 0,
      isPublic: false
    };
  }
}
