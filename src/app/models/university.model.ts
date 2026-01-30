// Modelos para Gestión de Universidades Miembros

export interface Authority {
  id: string;
  role: 'rector' | 'vicerrector_academico' | 'vicerrector_investigacion' | 'director_gird' | 'coordinador' | 'otro';
  fullName: string;
  academicDegree?: string;
  email?: string;
  phone?: string;
  dni?: string; // Solo intranet
  photoUrl?: string;
  position?: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  isActive: boolean;
  isPublic: boolean;
}

export interface TechnicalTeamMember {
  id: string;
  teamType: 'secretaria_tecnica' | 'comite_interareas' | 'grupo_trabajo';
  fullName: string;
  email?: string;
  phone?: string;
  dni?: string; // Solo intranet
  photoUrl?: string;
  position?: string;
  specialty?: string;
  areaRepresented?: string;
  resolutionNumber?: string;
  resolutionDate?: Date;
  resolutionFileUrl?: string;
  isActive: boolean;
  isPublic: boolean;
}

export interface UniversityReport {
  id: string;
  universityId: string;
  year: number;
  title: string;
  description?: string;

  // Periodo
  periodStart?: string;
  periodEnd?: string;

  // Archivo
  documentUrl?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;

  // Metadatos
  status: 'borrador' | 'en_revision' | 'aprobado' | 'publicado';
  uploadDate?: Date;
  submittedBy?: string;
  submittedAt?: Date;
  reportType?: 'actividades_gird' | 'actividades_acc' | 'informe_anual' | 'otro';
  isPublic: boolean;
  uploadedBy?: string;
}

export interface University {
  id: string;
  name: string;
  shortName: string;
  logoUrl?: string;
  websiteUrl?: string;
  address?: string;
  city: string;
  region: string;
  foundedYear?: number;

  // Estado de membresía
  membershipStatus: 'pendiente' | 'en_proceso' | 'activo' | 'suspendido' | 'inactivo';
  membershipDate?: Date;
  certificateNumber?: string;
  certificateFileUrl?: string;

  // Autoridades
  authorities: Authority[];

  // Equipo técnico
  technicalTeam: TechnicalTeamMember[];

  // Repositorio
  reports: UniversityReport[];

  // Metadatos
  isActive: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
