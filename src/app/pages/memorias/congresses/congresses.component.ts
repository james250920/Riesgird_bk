import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MemoriesService } from '../../../services';
import { CongressHistory } from '../../../models';
import { IconComponent } from '../../../shared/icons/icons.component';

@Component({
  selector: 'app-congresses',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './congresses.component.html',
  styleUrl: './congresses.component.scss'
})
export class CongressesComponent {
  memoriesService = inject(MemoriesService);

  searchQuery = '';
  yearFilter = 'all';
  typeFilter = 'all';
  scopeFilter = 'all';

  showModal = signal(false);
  editingCongress = signal<CongressHistory | null>(null);

  formData = {
    name: '',
    type: 'congreso' as CongressHistory['type'],
    edition: 1,
    year: new Date().getFullYear(),
    scope: 'nacional' as CongressHistory['scope'],
    theme: '',
    startDate: '',
    endDate: '',
    location: '',
    hostUniversity: '',
    participantsCount: 0,
    presentationsCount: 0,
    speakersCount: 0,
    bannerUrl: '',
    proceedingsUrl: '',
    photosAlbumUrl: '',
    videosPlaylistUrl: '',
    isPublic: false
  };

  congresses = this.memoriesService.congresses;
  filteredCongresses = signal<CongressHistory[]>([]);

  internationalCongresses = () => this.congresses().filter(c => c.scope === 'internacional').length;
  totalParticipants = () => this.congresses().reduce((sum, c) => sum + (c.participantsCount || 0), 0);
  totalPresentations = () => this.congresses().reduce((sum, c) => sum + (c.presentationsCount || 0), 0);

  availableYears = computed(() => {
    const years = [...new Set(this.congresses().map(c => c.year))];
    return years.sort((a, b) => b - a);
  });

  constructor() {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.congresses();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(query));
    }

    if (this.yearFilter !== 'all') {
      result = result.filter(c => c.year.toString() === this.yearFilter);
    }

    if (this.typeFilter !== 'all') {
      result = result.filter(c => c.type === this.typeFilter);
    }

    if (this.scopeFilter !== 'all') {
      result = result.filter(c => c.scope === this.scopeFilter);
    }

    this.filteredCongresses.set(result.sort((a, b) => b.year - a.year));
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      congreso: 'Congreso',
      simposio: 'Simposio',
      encuentro: 'Encuentro',
      jornada: 'Jornada',
      foro: 'Foro'
    };
    return labels[type] || type;
  }

  getScopeLabel(scope: string): string {
    const labels: Record<string, string> = {
      nacional: 'Nacional',
      internacional: 'Internacional',
      regional: 'Regional'
    };
    return labels[scope] || scope;
  }

  formatDateRange(start: Date, end: Date): string {
    const s = new Date(start);
    const e = new Date(end);
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return `${s.toLocaleDateString('es-PE', opts)} - ${e.toLocaleDateString('es-PE', { ...opts, year: 'numeric' })}`;
  }

  toggleVisibility(congress: CongressHistory): void {
    this.memoriesService.updateCongress(congress.id, { isPublic: !congress.isPublic });
    this.applyFilters();
  }

  openModal(): void {
    this.resetForm();
    this.showModal.set(true);
  }

  editCongress(congress: CongressHistory): void {
    this.editingCongress.set(congress);
    this.formData = {
      name: congress.name,
      type: congress.type,
      edition: congress.edition,
      year: congress.year,
      scope: congress.scope,
      theme: congress.theme || '',
      startDate: new Date(congress.startDate).toISOString().split('T')[0],
      endDate: new Date(congress.endDate).toISOString().split('T')[0],
      location: congress.location,
      hostUniversity: congress.hostUniversity || '',
      participantsCount: congress.participantsCount || 0,
      presentationsCount: congress.presentationsCount || 0,
      speakersCount: congress.speakersCount || 0,
      bannerUrl: congress.bannerUrl || '',
      proceedingsUrl: congress.proceedingsUrl || '',
      photosAlbumUrl: congress.photosAlbumUrl || '',
      videosPlaylistUrl: congress.videosPlaylistUrl || '',
      isPublic: congress.isPublic
    };
    this.showModal.set(true);
  }

  deleteCongress(congress: CongressHistory): void {
    if (confirm(`¿Eliminar "${congress.name}"?`)) {
      this.memoriesService.deleteCongress(congress.id);
      this.applyFilters();
    }
  }

  saveCongress(): void {
    if (!this.formData.name || !this.formData.startDate || !this.formData.endDate) return;

    if (this.editingCongress()) {
      this.memoriesService.updateCongress(this.editingCongress()!.id, {
        ...this.formData,
        startDate: new Date(this.formData.startDate),
        endDate: new Date(this.formData.endDate),
        updatedAt: new Date()
      });
    } else {
      const newCongress: CongressHistory = {
        id: crypto.randomUUID(),
        ...this.formData,
        startDate: new Date(this.formData.startDate),
        endDate: new Date(this.formData.endDate),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.memoriesService.addCongress(newCongress);
    }

    this.closeModal();
    this.applyFilters();
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingCongress.set(null);
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      name: '',
      type: 'congreso',
      edition: 1,
      year: new Date().getFullYear(),
      scope: 'nacional',
      theme: '',
      startDate: '',
      endDate: '',
      location: '',
      hostUniversity: '',
      participantsCount: 0,
      presentationsCount: 0,
      speakersCount: 0,
      bannerUrl: '',
      proceedingsUrl: '',
      photosAlbumUrl: '',
      videosPlaylistUrl: '',
      isPublic: false
    };
  }
}
