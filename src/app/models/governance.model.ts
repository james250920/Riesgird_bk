// Modelos para Gobernanza y Eventos

export interface Assembly {
  id: string;
  year: number;
  number: number; // Número de asamblea en el año
  title: string;
  description?: string;
  type: 'ordinaria' | 'extraordinaria';
  date: Date;
  location: string;
  modality: 'presencial' | 'virtual' | 'hibrida';
  virtualLink?: string;

  // Documentos
  agendaFileUrl?: string;
  agendaFileName?: string;
  agreementsFileUrl?: string;
  agreementsFileName?: string;
  convocationUrl?: string;
  minutesUrl?: string;
  minutesFileUrl?: string;
  minutesFileName?: string;

  // Contenido
  agendaItems: AgendaItem[];
  agreements: Agreement[];

  // Participantes
  attendeesCount?: number;

  // Galería
  photos: EventPhoto[];

  // Estado
  status: 'programada' | 'en_curso' | 'finalizada' | 'completada' | 'cancelada';
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface AgendaItem {
  id: string;
  order: number;
  title: string;
  description?: string;
  presenter?: string;
  duration?: number; // en minutos
}

export interface Agreement {
  id: string;
  number: string;
  title: string;
  description: string;
  responsible?: string;
  dueDate?: Date;
  status: 'pendiente' | 'en_proceso' | 'cumplido' | 'no_cumplido';
  isPublic: boolean;
}

export interface EventPhoto {
  id: string;
  eventId: string;
  eventType: 'asamblea' | 'foro' | 'congreso' | 'actividad';
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  photographer?: string;
  takenAt?: Date;
  order: number;
  isPublic: boolean;
  isFeatured: boolean;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface ForumEvent {
  id: string;
  title: string;
  description: string;
  type: 'convocatoria' | 'evento_conjunto' | 'informacion' | 'capacitacion' | 'taller' | 'seminario';
  startDate: Date;
  endDate?: Date;
  location?: string;
  modality?: 'presencial' | 'virtual' | 'hibrida';

  // Imagen
  bannerUrl?: string;

  // Organizadores
  organizers: string[];
  targetAudience?: string;

  // Registro
  capacity?: number;
  registeredCount?: number;
  requiresRegistration?: boolean;
  virtualLink?: string;

  // Documentos e información
  programFileUrl?: string;
  registrationUrl?: string;
  maxParticipants?: number;
  currentParticipants?: number;

  // Galería post-evento
  photos: EventPhoto[];

  // Estado
  status: 'borrador' | 'publicado' | 'en_curso' | 'finalizado' | 'cancelado';
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: 'asamblea' | 'foro' | 'congreso' | 'reunion' | 'capacitacion' | 'otro';
  startDate: Date;
  endDate?: Date;
  allDay: boolean;
  location?: string;
  color?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  status?: 'programada' | 'en_curso' | 'finalizada' | 'cancelada';
  isPublic: boolean;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}
