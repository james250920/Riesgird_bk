// Modelos para Gestión del Conocimiento y Talento

export interface Researcher {
  id: string;
  universityId: string;
  universityName?: string;

  // Datos personales
  fullName: string;
  email: string;
  phone?: string;
  dni?: string; // Solo intranet
  photoUrl?: string;

  // Información académica
  academicDegree: 'licenciado' | 'maestro' | 'doctor' | 'postdoctor';
  specialty?: string;
  researchAreas: string[];
  orcidId?: string;
  orcid?: string; // Alias para compatibilidad
  scopusId?: string;
  googleScholarUrl?: string;
  googleScholar?: string; // Alias para compatibilidad

  // Afiliación
  faculty?: string;
  department?: string;
  position?: string;

  // Investigaciones
  publications?: Publication[];
  publicationsCount?: number;

  // Biografía
  bio?: string;

  // Estado
  isActive?: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Publication {
  id: string;
  researcherId: string;
  title: string;
  type: 'articulo' | 'libro' | 'capitulo_libro' | 'tesis' | 'ponencia' | 'informe' | 'otro';
  authors: string[];
  year: number;
  journal?: string;
  volume?: string;
  pages?: string;
  doi?: string;
  url?: string;
  fileUrl?: string;
  abstract?: string;
  keywords: string[];
  isPublic: boolean;
  createdAt: Date;
}

export interface Expert {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  photoUrl?: string;

  // Título y organización
  title?: string;
  organization?: string;

  // Especialización
  expertiseAreas: string[];
  specialties?: string[];
  specialtyInRiskGovernance?: string;
  yearsOfExperience?: number;

  // Afiliación
  institution?: string;
  position?: string;
  country: string;
  city?: string;

  // Perfil
  bio?: string;
  biography?: string;
  linkedinUrl?: string;
  linkedin?: string;
  website?: string;
  cvFileUrl?: string;

  // Disponibilidad
  isAvailable?: boolean;
  availableForConsulting?: boolean;
  availableForTraining?: boolean;
  availableForResearch?: boolean;

  // Estado
  isActive: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SpecializationProgram {
  id: string;
  name: string;
  type: 'diplomado' | 'especializacion' | 'curso' | 'taller' | 'laboratorio_territorial';
  description: string;
  objectives?: string[];

  // Detalles
  duration: string;
  modality: 'presencial' | 'virtual' | 'hibrida';
  credits?: number;
  targetAudience?: string;
  requirements?: string;

  // Precio
  price?: number;

  // Fechas
  startDate?: Date;
  endDate?: Date;
  registrationDeadline?: Date;

  // Inscripciones
  enrollmentOpen?: boolean;
  graduatesCount?: number;

  // Organizadores
  organizingUniversities?: string[];
  coordinator?: string;

  // Archivos e imágenes
  imageUrl?: string;
  syllabusFileUrl?: string;
  syllabusUrl?: string; // Alias para compatibilidad
  brochureFileUrl?: string;
  registrationUrl?: string;

  // Estado
  status: 'planificado' | 'inscripciones_abiertas' | 'en_curso' | 'finalizado' | 'cancelado';
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Exportar Brigade como alias de UniversityBrigade para compatibilidad
export interface UniversityBrigade {
  id: string;
  name: string;
  type: 'emergencias' | 'primeros_auxilios' | 'evacuacion' | 'comunicaciones' | 'logistica';
  description?: string;

  // Afiliación
  universityId: string;
  universityName?: string;

  // Coordinación
  coordinator?: string;
  coordinatorEmail?: string;
  coordinatorPhone?: string;
  contactEmail?: string;

  // Miembros
  membersCount?: number;

  // Estado y fechas
  status: 'activa' | 'en_formacion' | 'inactiva';
  foundedDate?: Date;

  // Capacitación
  certifications?: string[];

  // Imagen
  logoUrl?: string;

  // Visibilidad
  isActive: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Mantener Brigade como alias para compatibilidad
export type Brigade = UniversityBrigade;

