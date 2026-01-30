import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KnowledgeService, UniversityService } from '../../../services';
import { Researcher } from '../../../models';
import { IconComponent } from '../../../shared/icons/icons.component';

@Component({
  selector: 'app-researchers',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './researchers.component.html',
  styleUrl: './researchers.component.scss'
})
export class ResearchersComponent {
  knowledgeService = inject(KnowledgeService);
  universityService = inject(UniversityService);

  searchQuery = '';
  universityFilter = 'all';
  areaFilter = 'all';
  degreeFilter = 'all';

  showModal = signal(false);
  editingResearcher = signal<Researcher | null>(null);

  researchAreas = [
    'Gestión del Riesgo',
    'Cambio Climático',
    'Ingeniería Sísmica',
    'Hidrología',
    'Geología',
    'Ordenamiento Territorial',
    'Desarrollo Sostenible',
    'Vulnerabilidad Social',
    'Resiliencia Urbana'
  ];

  formData = {
    fullName: '',
    academicDegree: 'doctor' as Researcher['academicDegree'],
    email: '',
    phone: '',
    photoUrl: '',
    universityId: '',
    faculty: '',
    department: '',
    researchAreas: [] as string[],
    orcid: '',
    scopusId: '',
    googleScholar: '',
    publicationsCount: 0,
    bio: '',
    isPublic: false
  };

  researchers = this.knowledgeService.researchers;
  universities = this.universityService.universities;
  filteredResearchers = signal<Researcher[]>([]);

  doctorates = () => this.researchers().filter(r => r.academicDegree === 'doctor').length;
  totalPublications = () => this.researchers().reduce((sum, r) => sum + (r.publicationsCount || 0), 0);

  constructor() {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.researchers();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(r =>
        r.fullName.toLowerCase().includes(query) ||
        r.email?.toLowerCase().includes(query)
      );
    }

    if (this.universityFilter !== 'all') {
      result = result.filter(r => r.universityId === this.universityFilter);
    }

    if (this.areaFilter !== 'all') {
      result = result.filter(r => r.researchAreas?.includes(this.areaFilter));
    }

    if (this.degreeFilter !== 'all') {
      result = result.filter(r => r.academicDegree === this.degreeFilter);
    }

    this.filteredResearchers.set(result);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  getDegreeLabel(degree: string): string {
    const labels: Record<string, string> = {
      doctor: 'Dr.',
      magister: 'Mg.',
      licenciado: 'Lic.'
    };
    return labels[degree] || degree;
  }

  getUniversityName(id: string): string {
    const uni = this.universities().find(u => u.id === id);
    return uni?.shortName || 'Sin universidad';
  }

  toggleVisibility(researcher: Researcher): void {
    this.knowledgeService.updateResearcher(researcher.id, { isPublic: !researcher.isPublic });
    this.applyFilters();
  }

  viewProfile(researcher: Researcher): void {
    alert(`Ver perfil de: ${researcher.fullName}`);
  }

  openModal(): void {
    this.resetForm();
    this.showModal.set(true);
  }

  editResearcher(researcher: Researcher): void {
    this.editingResearcher.set(researcher);
    this.formData = {
      fullName: researcher.fullName,
      academicDegree: researcher.academicDegree,
      email: researcher.email || '',
      phone: researcher.phone || '',
      photoUrl: researcher.photoUrl || '',
      universityId: researcher.universityId,
      faculty: researcher.faculty || '',
      department: researcher.department || '',
      researchAreas: [...(researcher.researchAreas || [])],
      orcid: researcher.orcid || '',
      scopusId: researcher.scopusId || '',
      googleScholar: researcher.googleScholar || '',
      publicationsCount: researcher.publicationsCount || 0,
      bio: researcher.bio || '',
      isPublic: researcher.isPublic
    };
    this.showModal.set(true);
  }

  deleteResearcher(researcher: Researcher): void {
    if (confirm(`¿Eliminar a "${researcher.fullName}"?`)) {
      this.knowledgeService.deleteResearcher(researcher.id);
      this.applyFilters();
    }
  }

  addArea(event: Event): void {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    if (input.value.trim() && !this.formData.researchAreas.includes(input.value.trim())) {
      this.formData.researchAreas.push(input.value.trim());
      input.value = '';
    }
  }

  removeArea(index: number): void {
    this.formData.researchAreas.splice(index, 1);
  }

  saveResearcher(): void {
    if (!this.formData.fullName || !this.formData.universityId) return;

    if (this.editingResearcher()) {
      this.knowledgeService.updateResearcher(this.editingResearcher()!.id, {
        ...this.formData,
        updatedAt: new Date()
      });
    } else {
      const newResearcher: Researcher = {
        id: crypto.randomUUID(),
        ...this.formData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.knowledgeService.addResearcher(newResearcher);
    }

    this.closeModal();
    this.applyFilters();
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingResearcher.set(null);
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      fullName: '',
      academicDegree: 'doctor',
      email: '',
      phone: '',
      photoUrl: '',
      universityId: '',
      faculty: '',
      department: '',
      researchAreas: [],
      orcid: '',
      scopusId: '',
      googleScholar: '',
      publicationsCount: 0,
      bio: '',
      isPublic: false
    };
  }
}
