import { Injectable, signal, computed } from '@angular/core';
import {
  Assembly,
  ForumEvent,
  CalendarEvent,
  AgendaItem,
  Agreement,
  EventPhoto
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class GovernanceService {

  private _assemblies = signal<Assembly[]>([]);
  private _forumEvents = signal<ForumEvent[]>([]);
  private _calendarEvents = signal<CalendarEvent[]>([]);

  // Computed signals
  readonly assemblies = computed(() => this._assemblies());
  readonly forumEvents = computed(() => this._forumEvents());
  readonly calendarEvents = computed(() => this._calendarEvents());

  readonly assembliesByYear = computed(() => {
    const assemblies = this._assemblies();
    const grouped: { [key: number]: Assembly[] } = {};
    assemblies.forEach(a => {
      if (!grouped[a.year]) {
        grouped[a.year] = [];
      }
      grouped[a.year].push(a);
    });
    return grouped;
  });

  readonly upcomingEvents = computed(() => {
    const now = new Date();
    return this._calendarEvents()
      .filter(e => new Date(e.startDate) > now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  });

  readonly publicAssemblies = computed(() =>
    this._assemblies().filter(a => a.isPublic)
  );

  readonly publicForumEvents = computed(() =>
    this._forumEvents().filter(e => e.isPublic)
  );

  // CRUD Asambleas
  addAssembly(assembly: Assembly): void {
    this._assemblies.update(assemblies => [...assemblies, assembly]);
  }

  updateAssembly(id: string, updates: Partial<Assembly>): void {
    this._assemblies.update(assemblies =>
      assemblies.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a)
    );
  }

  deleteAssembly(id: string): void {
    this._assemblies.update(assemblies => assemblies.filter(a => a.id !== id));
  }

  getAssemblyById(id: string): Assembly | undefined {
    return this._assemblies().find(a => a.id === id);
  }

  getAssembliesByYear(year: number): Assembly[] {
    return this._assemblies().filter(a => a.year === year);
  }

  // Gestión de Agenda
  addAgendaItem(assemblyId: string, item: AgendaItem): void {
    this._assemblies.update(assemblies =>
      assemblies.map(a => {
        if (a.id === assemblyId) {
          return { ...a, agendaItems: [...a.agendaItems, item], updatedAt: new Date() };
        }
        return a;
      })
    );
  }

  updateAgendaItem(assemblyId: string, itemId: string, updates: Partial<AgendaItem>): void {
    this._assemblies.update(assemblies =>
      assemblies.map(a => {
        if (a.id === assemblyId) {
          return {
            ...a,
            agendaItems: a.agendaItems.map(item =>
              item.id === itemId ? { ...item, ...updates } : item
            ),
            updatedAt: new Date()
          };
        }
        return a;
      })
    );
  }

  removeAgendaItem(assemblyId: string, itemId: string): void {
    this._assemblies.update(assemblies =>
      assemblies.map(a => {
        if (a.id === assemblyId) {
          return {
            ...a,
            agendaItems: a.agendaItems.filter(item => item.id !== itemId),
            updatedAt: new Date()
          };
        }
        return a;
      })
    );
  }

  // Gestión de Acuerdos
  addAgreement(assemblyId: string, agreement: Agreement): void {
    this._assemblies.update(assemblies =>
      assemblies.map(a => {
        if (a.id === assemblyId) {
          return { ...a, agreements: [...a.agreements, agreement], updatedAt: new Date() };
        }
        return a;
      })
    );
  }

  updateAgreement(assemblyId: string, agreementId: string, updates: Partial<Agreement>): void {
    this._assemblies.update(assemblies =>
      assemblies.map(a => {
        if (a.id === assemblyId) {
          return {
            ...a,
            agreements: a.agreements.map(ag =>
              ag.id === agreementId ? { ...ag, ...updates } : ag
            ),
            updatedAt: new Date()
          };
        }
        return a;
      })
    );
  }

  // Gestión de Fotos
  addPhoto(assemblyId: string, photo: EventPhoto): void {
    this._assemblies.update(assemblies =>
      assemblies.map(a => {
        if (a.id === assemblyId) {
          return { ...a, photos: [...a.photos, photo], updatedAt: new Date() };
        }
        return a;
      })
    );
  }

  removePhoto(assemblyId: string, photoId: string): void {
    this._assemblies.update(assemblies =>
      assemblies.map(a => {
        if (a.id === assemblyId) {
          return {
            ...a,
            photos: a.photos.filter(p => p.id !== photoId),
            updatedAt: new Date()
          };
        }
        return a;
      })
    );
  }

  // CRUD Eventos del Foro
  addForumEvent(event: ForumEvent): void {
    this._forumEvents.update(events => [...events, event]);
  }

  updateForumEvent(id: string, updates: Partial<ForumEvent>): void {
    this._forumEvents.update(events =>
      events.map(e => e.id === id ? { ...e, ...updates, updatedAt: new Date() } : e)
    );
  }

  deleteForumEvent(id: string): void {
    this._forumEvents.update(events => events.filter(e => e.id !== id));
  }

  getForumEventById(id: string): ForumEvent | undefined {
    return this._forumEvents().find(e => e.id === id);
  }

  // CRUD Calendario
  addCalendarEvent(event: CalendarEvent): void {
    this._calendarEvents.update(events => [...events, event]);
  }

  updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): void {
    this._calendarEvents.update(events =>
      events.map(e => e.id === id ? { ...e, ...updates } : e)
    );
  }

  deleteCalendarEvent(id: string): void {
    this._calendarEvents.update(events => events.filter(e => e.id !== id));
  }

  getEventsByDateRange(start: Date, end: Date): CalendarEvent[] {
    return this._calendarEvents().filter(e => {
      const eventDate = new Date(e.startDate);
      return eventDate >= start && eventDate <= end;
    });
  }

  getEventsByMonth(year: number, month: number): CalendarEvent[] {
    return this._calendarEvents().filter(e => {
      const eventDate = new Date(e.startDate);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  }
}
