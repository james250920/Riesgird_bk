import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KnowledgeService } from '../../../services';
import { SpecializationProgram } from '../../../models';
import { IconComponent } from '../../../shared/icons/icons.component';

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './programs.component.html',
  styleUrl: './programs.component.scss'
})
export class ProgramsComponent {
  knowledgeService = inject(KnowledgeService);

  searchQuery = '';
  typeFilter = 'all';
  statusFilter = 'all';
  modalityFilter = 'all';

  showModal = signal(false);
  editingProgram = signal<SpecializationProgram | null>(null);

  formData = {
    type: 'diplomado' as SpecializationProgram['type'],
    status: 'planificado' as SpecializationProgram['status'],
    name: '',
    description: '',
    duration: '',
    credits: 0,
    modality: 'presencial' as SpecializationProgram['modality'],
    price: 0,
    startDate: '',
    endDate: '',
    imageUrl: '',
    syllabusUrl: '',
    registrationUrl: '',
    enrollmentOpen: false,
    isPublic: false
  };

  programs = this.knowledgeService.programs;
  filteredPrograms = signal<SpecializationProgram[]>([]);

  activePrograms = () => this.programs().filter(p => p.status === 'en_curso' || p.status === 'inscripciones_abiertas').length;
  totalGraduates = () => this.programs().reduce((sum, p) => sum + (p.graduatesCount || 0), 0);
  openEnrollments = () => this.programs().filter(p => p.enrollmentOpen || p.status === 'inscripciones_abiertas').length;

  constructor() {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.programs();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(query));
    }

    if (this.typeFilter !== 'all') {
      result = result.filter(p => p.type === this.typeFilter);
    }

    if (this.statusFilter !== 'all') {
      result = result.filter(p => p.status === this.statusFilter);
    }

    if (this.modalityFilter !== 'all') {
      result = result.filter(p => p.modality === this.modalityFilter);
    }

    this.filteredPrograms.set(result);
  }

  getProgramTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      diplomado: 'graduation-cap',
      especializacion: 'certificate',
      maestria: 'award',
      curso: 'book',
      taller: 'settings'
    };
    return icons[type] || 'book-open';
  }

  getProgramTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      diplomado: 'Diplomado',
      especializacion: 'Especialización',
      maestria: 'Maestría',
      curso: 'Curso',
      taller: 'Taller'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      activo: 'Activo',
      proximo: 'Próximo',
      finalizado: 'Finalizado'
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

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  toggleVisibility(program: SpecializationProgram): void {
    this.knowledgeService.updateProgram(program.id, { isPublic: !program.isPublic });
    this.applyFilters();
  }

  openModal(): void {
    this.resetForm();
    this.showModal.set(true);
  }

  editProgram(program: SpecializationProgram): void {
    this.editingProgram.set(program);
    this.formData = {
      type: program.type,
      status: program.status,
      name: program.name,
      description: program.description || '',
      duration: program.duration,
      credits: program.credits || 0,
      modality: program.modality || 'presencial',
      price: program.price || 0,
      startDate: program.startDate ? new Date(program.startDate).toISOString().split('T')[0] : '',
      endDate: program.endDate ? new Date(program.endDate).toISOString().split('T')[0] : '',
      imageUrl: program.imageUrl || '',
      syllabusUrl: program.syllabusUrl || '',
      registrationUrl: program.registrationUrl || '',
      enrollmentOpen: program.enrollmentOpen || false,
      isPublic: program.isPublic
    };
    this.showModal.set(true);
  }

  deleteProgram(program: SpecializationProgram): void {
    if (confirm(`¿Eliminar "${program.name}"?`)) {
      this.knowledgeService.deleteProgram(program.id);
      this.applyFilters();
    }
  }

  saveProgram(): void {
    if (!this.formData.name || !this.formData.duration) return;

    if (this.editingProgram()) {
      this.knowledgeService.updateProgram(this.editingProgram()!.id, {
        ...this.formData,
        startDate: this.formData.startDate ? new Date(this.formData.startDate) : undefined,
        endDate: this.formData.endDate ? new Date(this.formData.endDate) : undefined,
        updatedAt: new Date()
      });
    } else {
      const newProgram: SpecializationProgram = {
        id: crypto.randomUUID(),
        ...this.formData,
        startDate: this.formData.startDate ? new Date(this.formData.startDate) : undefined,
        endDate: this.formData.endDate ? new Date(this.formData.endDate) : undefined,
        graduatesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.knowledgeService.addProgram(newProgram);
    }

    this.closeModal();
    this.applyFilters();
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingProgram.set(null);
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      type: 'diplomado',
      status: 'planificado',
      name: '',
      description: '',
      duration: '',
      credits: 0,
      modality: 'presencial',
      price: 0,
      startDate: '',
      endDate: '',
      imageUrl: '',
      syllabusUrl: '',
      registrationUrl: '',
      enrollmentOpen: false,
      isPublic: false
    };
  }
}
