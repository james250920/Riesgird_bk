import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KnowledgeService } from '../../../services';
import { Expert } from '../../../models';
import { IconComponent } from '../../../shared/icons/icons.component';

@Component({
  selector: 'app-experts',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './experts.component.html',
  styleUrl: './experts.component.scss'
})
export class ExpertsComponent {
  knowledgeService = inject(KnowledgeService);

  searchQuery = '';
  specialtyFilter = 'all';
  countryFilter = 'all';
  availabilityFilter = 'all';

  showModal = signal(false);
  editingExpert = signal<Expert | null>(null);

  specialties = [
    'Gestión del Riesgo',
    'Cambio Climático',
    'Sismología',
    'Vulcanología',
    'Hidrología',
    'Meteorología',
    'Planificación Urbana',
    'Respuesta a Emergencias',
    'Evaluación de Vulnerabilidad'
  ];

  formData = {
    fullName: '',
    title: '',
    organization: '',
    country: 'Perú',
    photoUrl: '',
    specialties: [] as string[],
    bio: '',
    email: '',
    phone: '',
    linkedin: '',
    website: '',
    isAvailable: true,
    isPublic: false
  };

  experts = this.knowledgeService.experts;
  filteredExperts = signal<Expert[]>([]);

  internationalExperts = () => this.experts().filter(e => e.country !== 'Perú').length;
  availableExperts = () => this.experts().filter(e => e.isAvailable).length;
  publicExperts = () => this.experts().filter(e => e.isPublic).length;

  availableCountries = computed(() => {
    const countries = new Set(this.experts().map(e => e.country));
    return Array.from(countries).sort();
  });

  constructor() {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.experts();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(e =>
        e.fullName.toLowerCase().includes(query) ||
        e.organization?.toLowerCase().includes(query)
      );
    }

    if (this.specialtyFilter !== 'all') {
      result = result.filter(e => e.specialties?.includes(this.specialtyFilter));
    }

    if (this.countryFilter !== 'all') {
      result = result.filter(e => e.country === this.countryFilter);
    }

    if (this.availabilityFilter === 'available') {
      result = result.filter(e => e.isAvailable);
    }

    this.filteredExperts.set(result);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  getCountryFlag(country: string): string {
    const flags: Record<string, string> = {
      'Perú': 'PE',
      'Chile': 'CL',
      'Colombia': 'CO',
      'Ecuador': 'EC',
      'México': 'MX',
      'España': 'ES',
      'Estados Unidos': 'US'
    };
    return flags[country] || 'globe';
  }

  toggleVisibility(expert: Expert): void {
    this.knowledgeService.updateExpert(expert.id, { isPublic: !expert.isPublic });
    this.applyFilters();
  }

  openModal(): void {
    this.resetForm();
    this.showModal.set(true);
  }

  editExpert(expert: Expert): void {
    this.editingExpert.set(expert);
    this.formData = {
      fullName: expert.fullName,
      title: expert.title || '',
      organization: expert.organization || '',
      country: expert.country,
      photoUrl: expert.photoUrl || '',
      specialties: [...(expert.specialties || [])],
      bio: expert.bio || '',
      email: expert.email || '',
      phone: expert.phone || '',
      linkedin: expert.linkedin || '',
      website: expert.website || '',
      isAvailable: expert.isAvailable ?? true,
      isPublic: expert.isPublic
    };
    this.showModal.set(true);
  }

  deleteExpert(expert: Expert): void {
    if (confirm(`¿Eliminar a "${expert.fullName}"?`)) {
      this.knowledgeService.deleteExpert(expert.id);
      this.applyFilters();
    }
  }

  addSpecialty(event: Event): void {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    if (input.value.trim() && !this.formData.specialties.includes(input.value.trim())) {
      this.formData.specialties.push(input.value.trim());
      input.value = '';
    }
  }

  removeSpecialty(index: number): void {
    this.formData.specialties.splice(index, 1);
  }

  saveExpert(): void {
    if (!this.formData.fullName || !this.formData.title) return;

    if (this.editingExpert()) {
      this.knowledgeService.updateExpert(this.editingExpert()!.id, {
        ...this.formData,
        expertiseAreas: this.formData.specialties || [],
        updatedAt: new Date()
      });
    } else {
      const newExpert: Expert = {
        id: crypto.randomUUID(),
        ...this.formData,
        expertiseAreas: this.formData.specialties || [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.knowledgeService.addExpert(newExpert);
    }

    this.closeModal();
    this.applyFilters();
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingExpert.set(null);
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      fullName: '',
      title: '',
      organization: '',
      country: 'Perú',
      photoUrl: '',
      specialties: [],
      bio: '',
      email: '',
      phone: '',
      linkedin: '',
      website: '',
      isAvailable: true,
      isPublic: false
    };
  }
}
