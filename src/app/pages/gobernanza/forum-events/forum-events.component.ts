import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GovernanceService } from '../../../services';
import { ForumEvent } from '../../../models';
import { IconComponent } from '../../../shared/icons/icons.component';

@Component({
  selector: 'app-forum-events',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './forum-events.component.html',
  styleUrl: './forum-events.component.scss'
})
export class ForumEventsComponent {
  governanceService = inject(GovernanceService);

  searchQuery = '';
  typeFilter = 'all';
  statusFilter = 'all';
  viewMode = signal<'grid' | 'list'>('grid');

  showModal = signal(false);
  editingEvent = signal<ForumEvent | null>(null);

  formData = {
    type: 'seminario' as ForumEvent['type'],
    status: 'borrador' as ForumEvent['status'],
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    modality: 'presencial' as ForumEvent['modality'],
    capacity: 0,
    location: '',
    bannerUrl: '',
    registrationUrl: '',
    virtualLink: '',
    isPublic: false,
    requiresRegistration: false
  };

  events = this.governanceService.forumEvents;
  filteredEvents = signal<ForumEvent[]>([]);

  upcomingEvents = () => this.events().filter(e => new Date(e.startDate) > new Date() && e.status !== 'cancelado').length;
  completedEvents = () => this.events().filter(e => e.status === 'finalizado').length;
  publicEvents = () => this.events().filter(e => e.isPublic).length;

  constructor() {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.events();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(e => e.title.toLowerCase().includes(query));
    }

    if (this.typeFilter !== 'all') {
      result = result.filter(e => e.type === this.typeFilter);
    }

    if (this.statusFilter !== 'all') {
      result = result.filter(e => e.status === this.statusFilter);
    }

    result = result.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    this.filteredEvents.set(result);
  }

  getEventTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      congreso: 'landmark',
      seminario: 'book-open',
      taller: 'settings',
      conferencia: 'users',
      webinar: 'monitor',
      reunion: 'handshake'
    };
    return icons[type] || 'calendar';
  }

  getEventTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      congreso: 'Congreso',
      seminario: 'Seminario',
      taller: 'Taller',
      conferencia: 'Conferencia',
      webinar: 'Webinar',
      reunion: 'Reunión'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      borrador: 'Borrador',
      publicado: 'Publicado',
      en_curso: 'En curso',
      finalizado: 'Finalizado',
      cancelado: 'Cancelado'
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

  formatDateRange(start: Date, end?: Date): string {
    const startDate = new Date(start);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };

    if (!end) return startDate.toLocaleDateString('es-PE', options);

    const endDate = new Date(end);
    if (startDate.toDateString() === endDate.toDateString()) {
      return startDate.toLocaleDateString('es-PE', options);
    }
    return `${startDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('es-PE', options)}`;
  }

  getRegistrationProgress(event: ForumEvent): number {
    if (!event.capacity || !event.registeredCount) return 0;
    return Math.min((event.registeredCount / event.capacity) * 100, 100);
  }

  toggleVisibility(event: ForumEvent): void {
    this.governanceService.updateForumEvent(event.id, { isPublic: !event.isPublic });
    this.applyFilters();
  }

  openModal(): void {
    this.resetForm();
    this.showModal.set(true);
  }

  editEvent(event: ForumEvent): void {
    this.editingEvent.set(event);
    this.formData = {
      type: event.type,
      status: event.status,
      title: event.title,
      description: event.description || '',
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
      modality: event.modality || 'presencial',
      capacity: event.capacity || 0,
      location: event.location || '',
      bannerUrl: event.bannerUrl || '',
      registrationUrl: event.registrationUrl || '',
      virtualLink: event.virtualLink || '',
      isPublic: event.isPublic,
      requiresRegistration: event.requiresRegistration || false
    };
    this.showModal.set(true);
  }

  deleteEvent(event: ForumEvent): void {
    if (confirm(`¿Eliminar "${event.title}"?`)) {
      this.governanceService.deleteForumEvent(event.id);
      this.applyFilters();
    }
  }

  saveEvent(): void {
    if (!this.formData.title || !this.formData.startDate) return;

    if (this.editingEvent()) {
      this.governanceService.updateForumEvent(this.editingEvent()!.id, {
        type: this.formData.type,
        status: this.formData.status,
        title: this.formData.title,
        description: this.formData.description || '',
        startDate: new Date(this.formData.startDate),
        endDate: this.formData.endDate ? new Date(this.formData.endDate) : undefined,
        modality: this.formData.modality,
        capacity: this.formData.capacity || undefined,
        location: this.formData.location || undefined,
        bannerUrl: this.formData.bannerUrl || undefined,
        registrationUrl: this.formData.registrationUrl || undefined,
        virtualLink: this.formData.virtualLink || undefined,
        isPublic: this.formData.isPublic,
        requiresRegistration: this.formData.requiresRegistration,
        updatedAt: new Date()
      });
    } else {
      const newEvent: ForumEvent = {
        id: crypto.randomUUID(),
        type: this.formData.type,
        status: this.formData.status,
        title: this.formData.title,
        description: this.formData.description || '',
        startDate: new Date(this.formData.startDate),
        endDate: this.formData.endDate ? new Date(this.formData.endDate) : undefined,
        modality: this.formData.modality,
        capacity: this.formData.capacity || undefined,
        location: this.formData.location || undefined,
        bannerUrl: this.formData.bannerUrl || undefined,
        registrationUrl: this.formData.registrationUrl || undefined,
        virtualLink: this.formData.virtualLink || undefined,
        isPublic: this.formData.isPublic,
        requiresRegistration: this.formData.requiresRegistration,
        registeredCount: 0,
        organizers: [],
        photos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin'
      };
      this.governanceService.addForumEvent(newEvent);
    }

    this.closeModal();
    this.applyFilters();
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingEvent.set(null);
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      type: 'capacitacion',
      status: 'borrador',
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      modality: 'presencial',
      capacity: 0,
      location: '',
      bannerUrl: '',
      registrationUrl: '',
      virtualLink: '',
      isPublic: false,
      requiresRegistration: false
    };
  }
}
