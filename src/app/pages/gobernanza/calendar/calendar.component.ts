import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GovernanceService } from '../../../services';
import { CalendarEvent, ForumEvent, Assembly } from '../../../models';
import { IconComponent } from '../../../shared/icons/icons.component';

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: (CalendarEvent | ForumEvent | Assembly)[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent {
  governanceService = inject(GovernanceService);

  weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  currentDate = signal(new Date());
  viewMode = signal<'month' | 'list'>('month');
  selectedDay = signal<CalendarDay | null>(null);
  showModal = signal(false);

  formData = {
    type: 'general' as 'general' | 'asamblea' | 'foro',
    title: '',
    startDate: '',
    endDate: '',
    location: '',
    description: '',
    isPublic: false
  };

  assemblies = this.governanceService.assemblies;
  forumEvents = this.governanceService.forumEvents;
  calendarEvents = this.governanceService.calendarEvents;

  currentMonthName = computed(() =>
    this.currentDate().toLocaleDateString('es-PE', { month: 'long' })
  );

  currentYear = computed(() => this.currentDate().getFullYear());

  allEvents = computed(() => {
    const events: (CalendarEvent | ForumEvent | Assembly)[] = [
      ...this.assemblies(),
      ...this.forumEvents(),
      ...this.calendarEvents()
    ];
    return events;
  });

  calendarDays = computed((): CalendarDay[] => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const endPadding = 6 - lastDay.getDay();

    const days: CalendarDay[] = [];
    const today = new Date();

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0);
    for (let i = startPadding - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay.getDate() - i);
      days.push(this.createCalendarDay(d, false, today));
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push(this.createCalendarDay(d, true, today));
    }

    // Next month days
    for (let i = 1; i <= endPadding; i++) {
      const d = new Date(year, month + 1, i);
      days.push(this.createCalendarDay(d, false, today));
    }

    return days;
  });

  groupedEvents = computed(() => {
    const events = [...this.allEvents()]
      .filter(e => this.getEventDate(e) >= new Date())
      .sort((a, b) => this.getEventDate(a).getTime() - this.getEventDate(b).getTime());

    const groups: { month: string; events: (CalendarEvent | ForumEvent | Assembly)[] }[] = [];

    events.forEach(event => {
      const date = this.getEventDate(event);
      const monthKey = date.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });

      let group = groups.find(g => g.month === monthKey);
      if (!group) {
        group = { month: monthKey, events: [] };
        groups.push(group);
      }
      group.events.push(event);
    });

    return groups;
  });

  createCalendarDay(date: Date, isCurrentMonth: boolean, today: Date): CalendarDay {
    const events = this.allEvents().filter(e => {
      const eventDate = this.getEventDate(e);
      return eventDate.toDateString() === date.toDateString();
    });

    return {
      date,
      day: date.getDate(),
      isCurrentMonth,
      isToday: date.toDateString() === today.toDateString(),
      events
    };
  }

  getEventDate(event: CalendarEvent | ForumEvent | Assembly): Date {
    if ('startDate' in event) return new Date(event.startDate);
    return new Date(event.date);
  }

  getEventId(event: CalendarEvent | ForumEvent | Assembly): string {
    return event.id;
  }

  getEventTitle(event: CalendarEvent | ForumEvent | Assembly): string {
    return event.title;
  }

  getEventLocation(event: CalendarEvent | ForumEvent | Assembly): string {
    return event.location || '';
  }

  getEventType(event: CalendarEvent | ForumEvent | Assembly): string {
    if ('number' in event && 'agenda' in event) return 'asamblea';
    if ('type' in event && event.type !== undefined && ['congreso', 'seminario', 'taller', 'conferencia', 'webinar', 'reunion'].includes(event.type)) return 'evento';
    return 'general';
  }

  getEventTypeLabel(event: CalendarEvent | ForumEvent | Assembly): string {
    const type = this.getEventType(event);
    if (type === 'asamblea') return 'Asamblea';
    if (type === 'evento') return 'Evento Foro';
    return 'General';
  }

  getEventStatus(event: CalendarEvent | ForumEvent | Assembly): string {
    if ('status' in event && event.status) return event.status;
    return 'programada';
  }

  getEventStatusLabel(event: CalendarEvent | ForumEvent | Assembly): string {
    const status = this.getEventStatus(event);
    const labels: Record<string, string> = {
      programada: 'Programada',
      publicado: 'Publicado',
      en_curso: 'En curso',
      completada: 'Completada',
      finalizado: 'Finalizado'
    };
    return labels[status] || status;
  }

  formatEventTime(event: CalendarEvent | ForumEvent | Assembly): string {
    const date = this.getEventDate(event);
    return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  formatSelectedDate(date: Date): string {
    return date.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  getDay(event: CalendarEvent | ForumEvent | Assembly): number {
    return this.getEventDate(event).getDate();
  }

  getWeekday(event: CalendarEvent | ForumEvent | Assembly): string {
    return this.getEventDate(event).toLocaleDateString('es-PE', { weekday: 'short' });
  }

  previousMonth(): void {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  goToToday(): void {
    this.currentDate.set(new Date());
  }

  selectDay(day: CalendarDay): void {
    this.selectedDay.set(day);
  }

  viewEvent(event: CalendarEvent | ForumEvent | Assembly): void {
    alert(`Ver evento: ${event.title}`);
  }

  editEvent(event: CalendarEvent | ForumEvent | Assembly): void {
    alert(`Editar evento: ${event.title}`);
  }

  openModal(): void {
    this.resetForm();
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.resetForm();
  }

  saveEvent(): void {
    if (!this.formData.title || !this.formData.startDate) return;

    const newEvent: CalendarEvent = {
      id: crypto.randomUUID(),
      title: this.formData.title,
      description: this.formData.description || undefined,
      type: 'otro',
      startDate: new Date(this.formData.startDate),
      endDate: this.formData.endDate ? new Date(this.formData.endDate) : undefined,
      allDay: false,
      location: this.formData.location || undefined,
      isPublic: this.formData.isPublic,
      createdAt: new Date(),
      createdBy: 'admin'
    };

    this.governanceService.addCalendarEvent(newEvent);
    this.closeModal();
  }

  resetForm(): void {
    this.formData = {
      type: 'general',
      title: '',
      startDate: '',
      endDate: '',
      location: '',
      description: '',
      isPublic: false
    };
  }
}
