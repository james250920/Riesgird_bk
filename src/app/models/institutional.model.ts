// Modelos para el Módulo de Identidad y Normativa

export interface InstitutionalContent {
  id: string;
  type: 'mision' | 'vision' | 'objetivos' | 'lineamientos';
  title: string;
  content: string; // HTML enriquecido
  isPublic: boolean;
  lastUpdated: Date;
  updatedBy: string;
}

export interface NormativeDocument {
  id: string;
  name: string;
  type: 'estatuto' | 'plan_trabajo' | 'reglamento' | 'otro';
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadDate: Date;
  validFrom: Date;
  validTo?: Date;
  isActive: boolean;
  isPublic: boolean;
  uploadedBy: string;
}

export interface Ally {
  id: string;
  name: string;
  type: 'cooperacion_internacional' | 'gobierno' | 'colegio_profesional' | 'institucion_privada' | 'otro';
  logoUrl: string;
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  description?: string;
  isActive: boolean;
  isPublic: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
