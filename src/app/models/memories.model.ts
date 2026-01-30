// Modelos para Memorias e Informes Históricos

export interface ManagementMemory {
  id: string;
  year: number;
  period?: string; // Ej: "Enero - Diciembre"
  title: string;
  description?: string;

  // Tipo y responsable
  type: 'anual' | 'semestral' | 'especial';
  president?: string;

  // Contenido
  introduction?: string;
  summary?: string;
  pageCount?: number;
  highlights?: string[];
  achievements?: Achievement[];
  activities?: Activity[];

  // Archivos
  documentUrl?: string;
  digitalBookUrl?: string;
  coverImageUrl?: string;

  // Estado
  status: 'borrador' | 'revision' | 'publicada';
  isPublic: boolean;
  publishedDate?: Date;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Achievement {
  id: string;
  memoryId: string;
  title: string;
  description: string;
  category: string;
  impactLevel: 'alto' | 'medio' | 'bajo';
  date?: Date;
  evidenceUrl?: string;
  order: number;
}

export interface Activity {
  id: string;
  memoryId: string;
  title: string;
  description: string;
  type: 'academica' | 'investigacion' | 'extension' | 'gestion' | 'cooperacion';
  date: Date;
  location?: string;
  participants?: number;
  photos: string[];
  documentsUrls: string[];
  order: number;
}

export interface MemoryStatistics {
  totalUniversities: number;
  totalResearchers: number;
  totalPublications: number;
  totalEvents: number;
  totalBeneficiaries: number;
  customStats: { label: string; value: string | number }[];
}

export interface Congress {
  id: string;
  number: number; // I, II, III...
  romanNumber: string;
  title: string;
  theme: string;

  // Fechas y lugar
  startDate: Date;
  endDate: Date;
  location: string;
  venue?: string;

  // Contenido
  description: string;
  objectives: string[];
  thematicAxes: ThematicAxis[];

  // Participantes
  keynoteSpeakers: Speaker[];
  organizingCommittee: CommitteeMember[];

  // Publicaciones
  proceedingsFileUrl?: string;
  abstractsBookFileUrl?: string;
  programFileUrl?: string;

  // Galería
  photos: string[];
  videos: VideoItem[];

  // Enlaces
  websiteUrl?: string;
  registrationUrl?: string;

  // Estado
  status: 'planificado' | 'convocatoria_abierta' | 'en_curso' | 'finalizado';
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ThematicAxis {
  id: string;
  name: string;
  description: string;
  coordinator?: string;
  order: number;
}

export interface Speaker {
  id: string;
  fullName: string;
  title: string;
  institution: string;
  country: string;
  photoUrl?: string;
  biography?: string;
  presentationTitle?: string;
  presentationType: 'magistral' | 'conferencia' | 'panel' | 'taller';
}

export interface CommitteeMember {
  id: string;
  fullName: string;
  role: string;
  institution: string;
  email?: string;
  order: number;
}

export interface VideoItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  type: 'conferencia' | 'panel' | 'entrevista' | 'resumen' | 'otro';
  order: number;
}

export interface PhotoAlbum {
  id: string;
  title: string;
  description?: string;
  type?: 'fotos' | 'videos' | 'mixto';
  eventType: 'congreso' | 'asamblea' | 'foro' | 'actividad_academica' | 'institucional' | 'otro' | 'capacitacion';
  eventId?: string;
  eventName?: string;
  eventDate?: Date;
  date: Date;

  // Fotos y multimedia
  photos: AlbumPhoto[];
  coverPhotoUrl?: string;
  coverImageUrl?: string;
  externalUrl?: string;
  downloadUrl?: string;
  itemsCount?: number;
  tags?: string[];

  // Estado
  isPublic: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface AlbumPhoto {
  id: string;
  albumId: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  photographer?: string;
  takenAt?: Date;
  order: number;
  isCover: boolean;
  isPublic: boolean;
}

// Interfaz para el historial de congresos (componente congresses)
export interface CongressHistory {
  id: string;
  edition: number;
  name: string;
  type: 'congreso' | 'simposio' | 'encuentro' | 'jornada' | 'foro';
  scope: 'nacional' | 'internacional' | 'regional';
  year: number;
  theme?: string;

  // Fechas y lugar
  startDate: Date;
  endDate: Date;
  location: string;
  hostUniversity?: string;

  // Estadísticas
  participantsCount?: number;
  presentationsCount?: number;
  speakersCount?: number;

  // Recursos
  bannerUrl?: string;
  proceedingsUrl?: string;
  photosAlbumUrl?: string;
  videosPlaylistUrl?: string;

  // Estado
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaz para álbumes multimedia (componente multimedia)
export interface MultimediaAlbum {
  id: string;
  title: string;
  description?: string;
  type: 'fotos' | 'videos' | 'mixto';
  eventType: 'congreso' | 'asamblea' | 'capacitacion' | 'institucional' | 'otro';
  eventDate: Date;
  coverImageUrl?: string;
  externalUrl?: string;
  itemsCount?: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

