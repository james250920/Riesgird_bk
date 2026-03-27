import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import {
  User,
  UserRole,
  Permission,
  AuditLog,
  SystemConfig,
  ModuleName,
  ActionType,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse
} from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly usersApiUrl = `${environment.backendUrl}/v1/users`;

  private _currentUser = signal<User | null>(null);
  private _users = signal<User[]>([
    {
      id: '1',
      email: 'admin@riesgird.edu.pe',
      fullName: 'Administrador Principal',
      role: 'super_admin',
      permissions: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  private _auditLogs = signal<AuditLog[]>([]);
  private _systemConfigs = signal<SystemConfig[]>([]);

  // Computed signals
  readonly currentUser = computed(() => this._currentUser());
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly users = computed(() => this._users());
  readonly auditLogs = computed(() => this._auditLogs());
  readonly systemConfigs = computed(() => this._systemConfigs());

  readonly userRole = computed(() => this._currentUser()?.role);

  readonly isSuperAdmin = computed(() =>
    this._currentUser()?.role === 'super_admin'
  );

  readonly isAdmin = computed(() => {
    const role = this._currentUser()?.role;
    return role === 'super_admin' || role === 'admin_red';
  });

  // Autenticación
  login(email: string, password: string): boolean {
    // Simulación de login - en producción conectar con backend
    const user = this._users().find(u => u.email === email && u.isActive);
    if (user) {
      this._currentUser.set({ ...user, lastLogin: new Date() });
      this.logAction('login', 'usuarios', 'user', user.id);
      return true;
    }
    return false;
  }

  loginWithApi(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.usersApiUrl}/login`, payload).pipe(
      tap(response => this.applyAuthSession(response, 'login')),
      catchError(error => throwError(() => this.normalizeApiError(error)))
    );
  }

  registerWithApi(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.usersApiUrl}/register`, payload).pipe(
      tap(response => this.applyAuthSession(response, 'create')),
      catchError(error => throwError(() => this.normalizeApiError(error)))
    );
  }

  logout(): void {
    const userId = this._currentUser()?.id;
    if (userId) {
      this.logAction('logout', 'usuarios', 'user', userId);
    }
    this._currentUser.set(null);
    this.removeStoredToken();
  }

  getApiErrorMessage(error: unknown): string {
    const normalized = this.normalizeApiError(error);
    return normalized.message;
  }

  hasActiveSession(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }

    const token = localStorage.getItem('auth_token');
    return Boolean(token);
  }

  // Permisos
  hasPermission(module: ModuleName, action: ActionType): boolean {
    const user = this._currentUser();
    if (!user) return false;

    // Super admin tiene todos los permisos
    if (user.role === 'super_admin') return true;

    // Admin de red tiene casi todos los permisos excepto gestión de usuarios
    if (user.role === 'admin_red' && module !== 'usuarios') return true;

    // Verificar permisos específicos
    const modulePermission = user.permissions.find(p => p.module === module);
    return modulePermission?.actions.includes(action) ?? false;
  }

  canManageVisibility(): boolean {
    const user = this._currentUser();
    if (!user) return false;
    return user.role === 'super_admin' || user.role === 'admin_red';
  }

  canPublish(): boolean {
    const user = this._currentUser();
    if (!user) return false;
    return ['super_admin', 'admin_red', 'editor'].includes(user.role);
  }

  // CRUD Usuarios
  addUser(user: User): void {
    this._users.update(users => [...users, user]);
    this.logAction('create', 'usuarios', 'user', user.id);
  }

  updateUser(id: string, updates: Partial<User>): void {
    this._users.update(users =>
      users.map(u => u.id === id ? { ...u, ...updates, updatedAt: new Date() } : u)
    );
    this.logAction('update', 'usuarios', 'user', id);
  }

  deleteUser(id: string): void {
    this._users.update(users => users.filter(u => u.id !== id));
    this.logAction('delete', 'usuarios', 'user', id);
  }

  getUserById(id: string): User | undefined {
    return this._users().find(u => u.id === id);
  }

  getUsersByRole(role: UserRole): User[] {
    return this._users().filter(u => u.role === role);
  }

  updateUserPermissions(userId: string, permissions: Permission[]): void {
    this._users.update(users =>
      users.map(u => u.id === userId ? { ...u, permissions, updatedAt: new Date() } : u)
    );
    this.logAction('update_permissions', 'usuarios', 'user', userId);
  }

  // Auditoría
  private logAction(
    action: string,
    module: ModuleName,
    entityType: string,
    entityId: string,
    changes?: { field: string; oldValue: any; newValue: any }[]
  ): void {
    const user = this._currentUser();
    if (!user) return;

    const log: AuditLog = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.fullName,
      action,
      module,
      entityType,
      entityId,
      changes,
      timestamp: new Date()
    };

    this._auditLogs.update(logs => [log, ...logs].slice(0, 1000)); // Mantener últimos 1000 registros
  }

  logUserAction(
    action: string,
    module: ModuleName,
    entityType: string,
    entityId: string,
    changes?: { field: string; oldValue: any; newValue: any }[]
  ): void {
    this.logAction(action, module, entityType, entityId, changes);
  }

  getAuditLogsByUser(userId: string): AuditLog[] {
    return this._auditLogs().filter(l => l.userId === userId);
  }

  getAuditLogsByModule(module: ModuleName): AuditLog[] {
    return this._auditLogs().filter(l => l.module === module);
  }

  getAuditLogsByDateRange(start: Date, end: Date): AuditLog[] {
    return this._auditLogs().filter(l => {
      const logDate = new Date(l.timestamp);
      return logDate >= start && logDate <= end;
    });
  }

  // Configuración del sistema
  getConfig(key: string): any {
    const config = this._systemConfigs().find(c => c.key === key);
    return config?.value;
  }

  setConfig(key: string, value: any, type: SystemConfig['type'], description?: string): void {
    const existingIndex = this._systemConfigs().findIndex(c => c.key === key);

    if (existingIndex >= 0) {
      this._systemConfigs.update(configs =>
        configs.map(c => c.key === key
          ? { ...c, value, updatedAt: new Date(), updatedBy: this._currentUser()?.fullName || 'system' }
          : c
        )
      );
    } else {
      const newConfig: SystemConfig = {
        id: crypto.randomUUID(),
        key,
        value,
        type,
        description,
        isEditable: true,
        updatedAt: new Date(),
        updatedBy: this._currentUser()?.fullName || 'system'
      };
      this._systemConfigs.update(configs => [...configs, newConfig]);
    }
  }

  private applyAuthSession(response: LoginResponse, action: string): void {
    const userPayload = (response as any)?.data?.user ?? (response as any)?.userResponse;
    const token = (response as any)?.data?.token ?? (response as any)?.token;

    if (!userPayload || !token) {
      throw new Error('La respuesta del servicio de autenticacion no tiene el formato esperado.');
    }

    const mappedUser = this.mapApiUserToUser(userPayload);
    this._currentUser.set(mappedUser);
    this.storeToken(token);
    this.logAction(action, 'usuarios', 'user', mappedUser.id);
  }

  private mapApiUserToUser(apiUser: any): User {
    const id = apiUser?.id ?? apiUser?.Id ?? crypto.randomUUID();
    const roleId = apiUser?.roleId ?? apiUser?.RoleId;

    return {
      id,
      email: apiUser?.email ?? apiUser?.Email ?? '',
      fullName: apiUser?.fullName ?? apiUser?.FullName ?? '',
      photoUrl: apiUser?.photoUrl ?? apiUser?.PhotoUrl,
      phone: (apiUser?.phone ?? apiUser?.Phone)?.toString(),
      role: this.mapRoleIdToUserRole(roleId),
      permissions: [],
      universityId: apiUser?.universityId ?? apiUser?.UniversityId,
      position: apiUser?.position ?? apiUser?.Position,
      isActive: apiUser?.isActive ?? apiUser?.IsActive ?? true,
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private mapRoleIdToUserRole(roleId?: string): UserRole {
    if (!roleId) return 'viewer';

    const normalizedRole = roleId.toLowerCase();

    if (normalizedRole.includes('super')) return 'super_admin';
    if (normalizedRole.includes('red')) return 'admin_red';
    if (normalizedRole.includes('universidad')) return 'admin_universidad';
    if (normalizedRole.includes('editor')) return 'editor';

    return 'viewer';
  }

  private normalizeApiError(error: unknown): Error {
    if (error instanceof HttpErrorResponse) {
      const backendMessage =
        error.error?.message ||
        error.error?.title ||
        error.error?.detail ||
        'No se pudo conectar con el servicio de autenticación.';

      return new Error(backendMessage);
    }

    return new Error('Ocurrió un error inesperado durante la autenticación.');
  }

  private storeToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  private removeStoredToken(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }
}
