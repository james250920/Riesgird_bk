// Modelos para Workflow de Membresía y Adscripción

export interface MembershipRequirement {
  id: string;
  order: number;
  title: string;
  description: string;
  category: 'documentacion' | 'legal' | 'tecnico' | 'financiero' | 'otro';
  type: 'obligatorio' | 'opcional';
  documentFormat?: string;
  maxFileSize?: string;
  isRequired: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DownloadableTemplate {
  id: string;
  type?: 'carta_solicitud' | 'resolucion_secretario' | 'resolucion_comite' | 'certificado_membresia' | 'otro';
  category: 'membresia' | 'informes' | 'solicitudes' | 'otros';
  format: 'PDF' | 'DOCX' | 'XLSX' | 'PPTX';
  name: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  version?: string;
  downloadCount?: number;
  uploadDate?: Date;
  isActive: boolean;
  isPublic: boolean;
  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MembershipApplication {
  id: string;
  applicationNumber?: string;
  universityId?: string;
  universityName: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  applicationDate: Date;

  // Contacto
  contactName?: string;
  contactPosition?: string;
  contactEmail?: string;
  contactPhone?: string;

  // Documentos enviados
  documents: ApplicationDocument[];

  // Estado del proceso
  status: 'recibida' | 'en_revision' | 'documentos_pendientes' | 'documentacion_incompleta' | 'aprobada' | 'rechazada';
  statusHistory: StatusChange[];

  // Asignación y revisión
  assignedTo?: string;
  submittedAt?: Date;
  reviewStartedAt?: Date;
  reviewCompletedAt?: Date;
  rejectionReason?: string;

  // Asignación de certificado
  certificateAssigned: boolean;
  certificateNumber?: string;
  certificateDate?: Date;
  certificateFileUrl?: string;

  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  reviewedBy?: string;
}

export interface ApplicationDocument {
  id: string;
  applicationId: string;
  type: 'carta_solicitud' | 'resolucion_secretario' | 'resolucion_comite' | 'otro';
  name: string;
  fileUrl: string;
  fileName: string;
  uploadDate: Date;
  status?: 'pendiente' | 'aprobado' | 'rechazado';
  isValid: boolean;
  validationNotes?: string;
  validatedBy?: string;
  validatedAt?: Date;
}

export interface StatusChange {
  status: string;
  date: Date;
  changedBy: string;
  notes?: string;
}

export interface MembershipCertificate {
  id: string;
  universityId: string;
  universityName: string;
  certificateNumber: string;
  issueDate: Date;
  validFrom: Date;
  validTo?: Date;
  templateId: string;
  generatedFileUrl?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}
