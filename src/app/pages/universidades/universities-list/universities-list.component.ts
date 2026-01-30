import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UniversityService } from '../../../services';
import { University } from '../../../models';
import { IconComponent } from '../../../shared/icons/icons.component';

@Component({
  selector: 'app-universities-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent],
  templateUrl: './universities-list.component.html',
  styleUrl: './universities-list.component.scss'
})
export class UniversitiesListComponent {
  universityService = inject(UniversityService);

  searchQuery = '';
  statusFilter = 'all';
  regionFilter = 'all';
  viewMode = signal<'grid' | 'list'>('list');
  showModal = signal(false);
  editingUniversity = signal<University | null>(null);

  formData = {
    name: '',
    shortName: '',
    city: '',
    region: '',
    websiteUrl: '',
    foundedYear: null as number | null,
    address: '',
    membershipStatus: 'pendiente' as University['membershipStatus'],
    membershipDate: '',
    certificateNumber: '',
    isPublic: true,
    isActive: true
  };

  filteredUniversities = signal<University[]>([]);

  regions = computed(() => {
    const allRegions = this.universityService.universities().map(u => u.region);
    return [...new Set(allRegions)].sort();
  });

  statusStats = computed(() => {
    const stats = this.universityService.universitiesByStatus();
    return [
      { status: 'activo', label: 'Activas', count: stats.activo.length, color: '#38a169' },
      { status: 'en_proceso', label: 'En proceso', count: stats.en_proceso.length, color: '#4299e1' },
      { status: 'pendiente', label: 'Pendientes', count: stats.pendiente.length, color: '#ed8936' },
      { status: 'suspendido', label: 'Suspendidas', count: stats.suspendido.length, color: '#e53e3e' },
      { status: 'inactivo', label: 'Inactivas', count: stats.inactivo.length, color: '#a0aec0' }
    ];
  });

  constructor() {
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.universityService.universities();

    if (this.searchQuery) {
      result = this.universityService.searchUniversities(this.searchQuery);
    }

    if (this.statusFilter !== 'all') {
      result = result.filter(u => u.membershipStatus === this.statusFilter);
    }

    if (this.regionFilter !== 'all') {
      result = result.filter(u => u.region === this.regionFilter);
    }

    this.filteredUniversities.set(result);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'activo': 'Activo',
      'en_proceso': 'En proceso',
      'pendiente': 'Pendiente',
      'suspendido': 'Suspendido',
      'inactivo': 'Inactivo'
    };
    return labels[status] || status;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-PE', {
      month: 'short',
      year: 'numeric'
    });
  }

  openModal(): void {
    this.resetForm();
    this.showModal.set(true);
  }

  editUniversity(university: University): void {
    this.editingUniversity.set(university);
    this.formData = {
      name: university.name,
      shortName: university.shortName,
      city: university.city,
      region: university.region,
      websiteUrl: university.websiteUrl || '',
      foundedYear: university.foundedYear || null,
      address: university.address || '',
      membershipStatus: university.membershipStatus,
      membershipDate: university.membershipDate
        ? new Date(university.membershipDate).toISOString().split('T')[0]
        : '',
      certificateNumber: university.certificateNumber || '',
      isPublic: university.isPublic,
      isActive: university.isActive
    };
    this.showModal.set(true);
  }

  toggleVisibility(university: University): void {
    this.universityService.updateUniversity(university.id, {
      isPublic: !university.isPublic
    });
    this.applyFilters();
  }

  manageAuthorities(university: University): void {
    // Navegar a gestión de autoridades
  }

  deleteUniversity(university: University): void {
    if (confirm(`¿Está seguro de eliminar "${university.name}"?`)) {
      this.universityService.deleteUniversity(university.id);
      this.applyFilters();
    }
  }

  saveUniversity(): void {
    if (this.editingUniversity()) {
      this.universityService.updateUniversity(this.editingUniversity()!.id, {
        name: this.formData.name,
        shortName: this.formData.shortName,
        city: this.formData.city,
        region: this.formData.region,
        websiteUrl: this.formData.websiteUrl || undefined,
        foundedYear: this.formData.foundedYear || undefined,
        address: this.formData.address || undefined,
        membershipStatus: this.formData.membershipStatus,
        membershipDate: this.formData.membershipDate
          ? new Date(this.formData.membershipDate)
          : undefined,
        certificateNumber: this.formData.certificateNumber || undefined,
        isPublic: this.formData.isPublic,
        isActive: this.formData.isActive,
        updatedBy: 'admin'
      });
    } else {
      const newUniversity: University = {
        id: crypto.randomUUID(),
        name: this.formData.name,
        shortName: this.formData.shortName,
        city: this.formData.city,
        region: this.formData.region,
        websiteUrl: this.formData.websiteUrl || undefined,
        foundedYear: this.formData.foundedYear || undefined,
        address: this.formData.address || undefined,
        membershipStatus: this.formData.membershipStatus,
        membershipDate: this.formData.membershipDate
          ? new Date(this.formData.membershipDate)
          : undefined,
        certificateNumber: this.formData.certificateNumber || undefined,
        authorities: [],
        technicalTeam: [],
        reports: [],
        isPublic: this.formData.isPublic,
        isActive: this.formData.isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin',
        updatedBy: 'admin'
      };
      this.universityService.addUniversity(newUniversity);
    }
    this.closeModal();
    this.applyFilters();
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingUniversity.set(null);
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      name: '',
      shortName: '',
      city: '',
      region: '',
      websiteUrl: '',
      foundedYear: null,
      address: '',
      membershipStatus: 'pendiente',
      membershipDate: '',
      certificateNumber: '',
      isPublic: true,
      isActive: true
    };
  }
}
