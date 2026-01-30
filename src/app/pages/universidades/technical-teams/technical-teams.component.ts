import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UniversityService } from '../../../services';
import { University, TechnicalTeamMember } from '../../../models';
import { IconComponent } from '../../../shared/icons/icons.component';

@Component({
  selector: 'app-technical-teams',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './technical-teams.component.html',
  styleUrl: './technical-teams.component.scss'
})
export class TechnicalTeamsComponent {
  universityService = inject(UniversityService);

  selectedUniversityId = '';
  searchQuery = '';
  teamTypeFilter = 'all';
  statusFilter = 'all';

  showModal = signal(false);
  editingItem = signal<{ member: TechnicalTeamMember; university: University } | null>(null);

  formData = {
    universityId: '',
    teamType: 'secretaria_tecnica' as TechnicalTeamMember['teamType'],
    fullName: '',
    position: '',
    specialty: '',
    areaRepresented: '',
    email: '',
    phone: '',
    photoUrl: '',
    isActive: true
  };

  universities = this.universityService.universities;

  allMembers = computed(() => {
    const result: { member: TechnicalTeamMember; university: University }[] = [];
    for (const university of this.universities()) {
      for (const member of university.technicalTeam) {
        result.push({ member, university });
      }
    }
    return result;
  });

  filteredMembers = signal<{ member: TechnicalTeamMember; university: University }[]>([]);

  groupedByUniversity = computed(() => {
    const filtered = this.filteredMembers();
    const grouped = new Map<string, { university: University; members: TechnicalTeamMember[] }>();

    for (const item of filtered) {
      if (!grouped.has(item.university.id)) {
        grouped.set(item.university.id, { university: item.university, members: [] });
      }
      grouped.get(item.university.id)!.members.push(item.member);
    }

    return Array.from(grouped.values());
  });

  universitiesWithTeams = computed(() => {
    return this.universities().filter(u => u.technicalTeam.length > 0).length;
  });

  constructor() {
    this.applyFilters();
  }

  onUniversityChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.allMembers();

    if (this.selectedUniversityId) {
      result = result.filter(item => item.university.id === this.selectedUniversityId);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(item =>
        item.member.fullName.toLowerCase().includes(query) ||
        (item.member.position?.toLowerCase().includes(query)) ||
        item.member.specialty?.toLowerCase().includes(query)
      );
    }

    if (this.teamTypeFilter !== 'all') {
      result = result.filter(item => item.member.teamType === this.teamTypeFilter);
    }

    if (this.statusFilter !== 'all') {
      const isActive = this.statusFilter === 'active';
      result = result.filter(item => item.member.isActive === isActive);
    }

    this.filteredMembers.set(result);
  }

  getSecretariaTecnica(members: TechnicalTeamMember[]): TechnicalTeamMember[] {
    return members.filter(m => m.teamType === 'secretaria_tecnica');
  }

  getComiteInterareas(members: TechnicalTeamMember[]): TechnicalTeamMember[] {
    return members.filter(m => m.teamType === 'comite_interareas');
  }

  getGruposTrabajo(members: TechnicalTeamMember[]): TechnicalTeamMember[] {
    return members.filter(m => m.teamType === 'grupo_trabajo');
  }

  getStatCount(teamType: string): number {
    return this.allMembers().filter(m => m.member.teamType === teamType && m.member.isActive).length;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  openModal(): void {
    this.resetForm();
    this.showModal.set(true);
  }

  editMember(member: TechnicalTeamMember, university: University): void {
    this.editingItem.set({ member, university });
    this.formData = {
      universityId: university.id,
      teamType: member.teamType,
      fullName: member.fullName,
      position: member.position || '',
      specialty: member.specialty || '',
      areaRepresented: member.areaRepresented || '',
      email: member.email || '',
      phone: member.phone || '',
      photoUrl: member.photoUrl || '',
      isActive: member.isActive
    };
    this.showModal.set(true);
  }

  deleteMember(member: TechnicalTeamMember, university: University): void {
    if (confirm(`¿Está seguro de eliminar a "${member.fullName}"?`)) {
      this.universityService.removeTechnicalTeamMember(university.id, member.id);
      this.applyFilters();
    }
  }

  saveMember(): void {
    if (!this.formData.universityId || !this.formData.fullName) return;

    const memberData: TechnicalTeamMember = {
      id: this.editingItem()?.member.id || crypto.randomUUID(),
      teamType: this.formData.teamType,
      fullName: this.formData.fullName,
      position: this.formData.position || undefined,
      specialty: this.formData.specialty || undefined,
      areaRepresented: this.formData.areaRepresented || undefined,
      email: this.formData.email || undefined,
      phone: this.formData.phone || undefined,
      photoUrl: this.formData.photoUrl || undefined,
      isActive: this.formData.isActive,
      isPublic: true
    };

    if (this.editingItem()) {
      this.universityService.updateTechnicalTeamMember(
        this.formData.universityId,
        memberData.id,
        memberData
      );
    } else {
      this.universityService.addTechnicalTeamMember(this.formData.universityId, memberData);
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
      teamType: 'secretaria_tecnica',
      fullName: '',
      position: '',
      specialty: '',
      areaRepresented: '',
      email: '',
      phone: '',
      photoUrl: '',
      isActive: true
    };
  }
}
