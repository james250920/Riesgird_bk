// Modelos para Usuarios y Permisos

export interface User {
  id: string;
  email: string;
  fullName: string;
  photoUrl?: string;
  phone?: string;

  // Rol y permisos
  role: UserRole;
  permissions: Permission[];

  // Afiliación
  universityId?: string;
  universityName?: string;
  position?: string;

  // Estado
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole =
  | 'super_admin'      // Acceso total
  | 'admin_red'        // Administrador de la red
  | 'admin_universidad' // Administrador de una universidad específica
  | 'editor'           // Puede editar contenido
  | 'viewer';          // Solo lectura

export interface Permission {
  module: ModuleName;
  actions: ActionType[];
}

export type ModuleName =
  | 'identidad_normativa'
  | 'universidades'
  | 'membresia'
  | 'gobernanza'
  | 'conocimiento'
  | 'memorias'
  | 'usuarios'
  | 'configuracion';

export type ActionType =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'publish'
  | 'manage_visibility';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: ModuleName;
  entityType: string;
  entityId: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  isEditable: boolean;
  updatedAt: Date;
  updatedBy: string;
}
