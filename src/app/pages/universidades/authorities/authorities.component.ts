import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UniversityService } from '../../../services';
import { University, Authority } from '../../../models';
import { IconComponent } from '../../../shared/icons/icons.component';

@Component({
  selector: 'app-authorities',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './authorities.component.html',
  styleUrl: './authorities.component.scss'
})
export class AuthoritiesComponent {
  universityService = inject(UniversityService);

  selectedUniversityId = '';
  searchQuery = '';
  roleFilter = 'all';
  statusFilter = 'all';

  showModal = signal(false);
  editingItem = signal<{ authority: Authority; university: University } | null>(null);

  formData = {
    universityId: '',
    fullName: '',
    academicDegree: '',
    email: '',
    phone: '',
    photoUrl: '',
    role: 'rector' as Authority['role'],
    position: '',
    startDate: '',
    endDate: '',
    isCurrent: true
  };

  universities = this.universityService.universities;

  allAuthorities = computed(() => {
    const result: { authority: Authority; university: University }[] = [];
    for (const university of this.universities()) {
      for (const authority of university.authorities) {
        result.push({ authority, university });
      }
    }
    return result;
  });

  filteredAuthorities = signal<{ authority: Authority; university: University }[]>([]);

  roleStats = computed(() => {
    const all = this.allAuthorities();
    const active = all.filter(a => a.authority.isCurrent);

    return [
      { role: 'rector', label: 'Rectores', count: active.filter(a => a.authority.role === 'rector').length, icon: 'briefcase' },
      { role: 'vicerrector', label: 'Vicerrectores', count: active.filter(a => a.authority.role.includes('vicerrector')).length, icon: 'graduation-cap' },
      { role: 'director', label: 'Directores GIRD', count: active.filter(a => a.authority.role === 'director_gird').length, icon: 'clipboard-list' },
      { role: 'total', label: 'Total activos', count: active.length, icon: 'users' }
    ];
  });

  constructor() {
    this.applyFilters();
  }

  onUniversityChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.allAuthorities();

    if (this.selectedUniversityId) {
      result = result.filter(item => item.university.id === this.selectedUniversityId);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(item =>
        item.authority.fullName.toLowerCase().includes(query) ||
        item.university.name.toLowerCase().includes(query) ||
        item.authority.email?.toLowerCase().includes(query)
      );
    }

    if (this.roleFilter !== 'all') {
      result = result.filter(item => item.authority.role === this.roleFilter);
    }

    if (this.statusFilter !== 'all') {
      const isActive = this.statusFilter === 'active';
      result = result.filter(item => item.authority.isCurrent === isActive);
    }

    this.filteredAuthorities.set(result);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'rector': 'Rector',
      'vicerrector_academico': 'Vicerrector Académico',
      'vicerrector_investigacion': 'Vicerrector de Investigación',
      'director_gird': 'Director GIRD-ACC',
      'coordinador': 'Coordinador',
      'otro': 'Otro'
    };
    return labels[role] || role;
  }

  getRoleClass(role: string): string {
    return role.replace('_', '-');
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

  editAuthority(item: { authority: Authority; university: University }): void {
    this.editingItem.set(item);
    this.formData = {
      universityId: item.university.id,
      fullName: item.authority.fullName,
      academicDegree: item.authority.academicDegree || '',
      email: item.authority.email || '',
      phone: item.authority.phone || '',
      photoUrl: item.authority.photoUrl || '',
      role: item.authority.role,
      position: item.authority.position || '',
      startDate: new Date(item.authority.startDate).toISOString().split('T')[0],
      endDate: item.authority.endDate
        ? new Date(item.authority.endDate).toISOString().split('T')[0]
        : '',
      isCurrent: item.authority.isCurrent
    };
    this.showModal.set(true);
  }

  deleteAuthority(item: { authority: Authority; university: University }): void {
    if (confirm(`¿Está seguro de eliminar a "${item.authority.fullName}"?`)) {
      this.universityService.removeAuthority(item.university.id, item.authority.id);
      this.applyFilters();
    }
  }

  saveAuthority(): void {
    if (!this.formData.universityId || !this.formData.fullName) return;

    const authorityData: Authority = {
      id: this.editingItem()?.authority.id || crypto.randomUUID(),
      fullName: this.formData.fullName,
      academicDegree: this.formData.academicDegree || undefined,
      email: this.formData.email || undefined,
      phone: this.formData.phone || undefined,
      photoUrl: this.formData.photoUrl || undefined,
      role: this.formData.role,
      position: this.formData.position || undefined,
      startDate: new Date(this.formData.startDate),
      endDate: this.formData.endDate ? new Date(this.formData.endDate) : undefined,
      isCurrent: this.formData.isCurrent,
      isActive: this.formData.isCurrent,
      isPublic: true
    };

    if (this.editingItem()) {
      // Update existing
      this.universityService.updateAuthority(
        this.formData.universityId,
        authorityData.id,
        authorityData
      );
    } else {
      // Add new
      this.universityService.addAuthority(this.formData.universityId, authorityData);
    }

    this.closeModal();
    this.applyFilters();
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingItem.set(null);
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      universityId: this.selectedUniversityId || '',
      fullName: '',
      academicDegree: '',
      email: '',
      phone: '',
      photoUrl: '',
      role: 'rector',
      position: '',
      startDate: '',
      endDate: '',
      isCurrent: true
    };
  }
}
