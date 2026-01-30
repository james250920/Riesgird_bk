import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MemoriesService } from '../../../services';
import { PhotoAlbum } from '../../../models';
import { IconComponent } from '../../../shared/icons/icons.component';

@Component({
  selector: 'app-multimedia',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './multimedia.component.html',
  styleUrl: './multimedia.component.scss'
})
export class MultimediaComponent {
  memoriesService = inject(MemoriesService);

  viewMode = signal<'grid' | 'list'>('grid');
  searchQuery = '';
  typeFilter = 'all';
  yearFilter = 'all';
  eventTypeFilter = 'all';

  showModal = signal(false);
  editingAlbum = signal<PhotoAlbum | null>(null);

  formData = {
    title: '',
    type: 'fotos' as PhotoAlbum['type'],
    eventType: 'institucional' as PhotoAlbum['eventType'],
    eventDate: '',
    itemsCount: 0,
    description: '',
    coverImageUrl: '',
    externalUrl: '',
    downloadUrl: '',
    tags: '',
    isPublic: false
  };

  albums = this.memoriesService.albums;
  filteredAlbums = signal<PhotoAlbum[]>([]);

  photoAlbums = () => this.albums().filter(a => a.type === 'fotos').length;
  videoAlbums = () => this.albums().filter(a => a.type === 'videos').length;
  publicAlbums = () => this.albums().filter(a => a.isPublic).length;

  availableYears = computed(() => {
    const years = this.albums()
      .filter(a => a.eventDate)
      .map(a => new Date(a.eventDate!).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a);
  });

  constructor() {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.albums();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(a => a.title.toLowerCase().includes(query));
    }

    if (this.typeFilter !== 'all') {
      result = result.filter(a => a.type === this.typeFilter);
    }

    if (this.yearFilter !== 'all') {
      result = result.filter(a =>
        a.eventDate && new Date(a.eventDate).getFullYear().toString() === this.yearFilter
      );
    }

    if (this.eventTypeFilter !== 'all') {
      result = result.filter(a => a.eventType === this.eventTypeFilter);
    }

    this.filteredAlbums.set(result);
  }

  getTypeIcon(type?: string): string {
    const icons: Record<string, string> = {
      fotos: '📸',
      videos: '🎬',
      mixto: '📁'
    };
    return icons[type || 'fotos'] || '📁';
  }

  getTypeLabel(type?: string): string {
    const labels: Record<string, string> = {
      fotos: 'Fotos',
      videos: 'Videos',
      mixto: 'Mixto'
    };
    return labels[type || 'fotos'] || (type || 'Fotos');
  }

  getEventTypeLabel(eventType: string): string {
    const labels: Record<string, string> = {
      congreso: 'Congreso',
      asamblea: 'Asamblea',
      capacitacion: 'Capacitación',
      institucional: 'Institucional',
      otro: 'Otro'
    };
    return labels[eventType] || eventType;
  }

  formatDate(date?: Date): string {
    if (!date) return 'Sin fecha';
    return new Date(date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  openAlbum(album: PhotoAlbum): void {
    if (album.externalUrl) {
      window.open(album.externalUrl, '_blank');
    }
  }

  toggleVisibility(album: PhotoAlbum): void {
    this.memoriesService.updateAlbum(album.id, { isPublic: !album.isPublic });
    this.applyFilters();
  }

  openModal(): void {
    this.resetForm();
    this.showModal.set(true);
  }

  editAlbum(album: PhotoAlbum): void {
    this.editingAlbum.set(album);
    this.formData = {
      title: album.title,
      type: album.type || 'fotos',
      eventType: album.eventType || 'institucional',
      eventDate: album.eventDate ? new Date(album.eventDate).toISOString().split('T')[0] : '',
      itemsCount: album.itemsCount || 0,
      description: album.description || '',
      coverImageUrl: album.coverImageUrl || '',
      externalUrl: album.externalUrl || '',
      downloadUrl: album.downloadUrl || '',
      tags: album.tags?.join(', ') || '',
      isPublic: album.isPublic
    };
    this.showModal.set(true);
  }

  deleteAlbum(album: PhotoAlbum): void {
    if (confirm(`¿Eliminar "${album.title}"?`)) {
      this.memoriesService.deleteAlbum(album.id);
      this.applyFilters();
    }
  }

  saveAlbum(): void {
    if (!this.formData.title) return;

    const tags = this.formData.tags.split(',').map(t => t.trim()).filter(t => t);

    if (this.editingAlbum()) {
      this.memoriesService.updateAlbum(this.editingAlbum()!.id, {
        title: this.formData.title,
        type: this.formData.type,
        eventType: this.formData.eventType,
        eventDate: this.formData.eventDate ? new Date(this.formData.eventDate) : undefined,
        itemsCount: this.formData.itemsCount,
        description: this.formData.description,
        coverImageUrl: this.formData.coverImageUrl,
        externalUrl: this.formData.externalUrl,
        downloadUrl: this.formData.downloadUrl,
        tags,
        isPublic: this.formData.isPublic,
        updatedAt: new Date()
      });
    } else {
      const newAlbum: PhotoAlbum = {
        id: crypto.randomUUID(),
        title: this.formData.title,
        type: this.formData.type,
        eventType: this.formData.eventType,
        eventDate: this.formData.eventDate ? new Date(this.formData.eventDate) : undefined,
        date: new Date(),
        itemsCount: this.formData.itemsCount,
        description: this.formData.description,
        coverImageUrl: this.formData.coverImageUrl,
        externalUrl: this.formData.externalUrl,
        downloadUrl: this.formData.downloadUrl,
        tags,
        photos: [],
        isPublic: this.formData.isPublic,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin'
      };
      this.memoriesService.addAlbum(newAlbum);
    }

    this.closeModal();
    this.applyFilters();
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingAlbum.set(null);
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      title: '',
      type: 'fotos',
      eventType: 'institucional',
      eventDate: '',
      itemsCount: 0,
      description: '',
      coverImageUrl: '',
      externalUrl: '',
      downloadUrl: '',
      tags: '',
      isPublic: false
    };
  }
}
