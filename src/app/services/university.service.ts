import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { University, Authority, TechnicalTeamMember, UniversityReport } from '../models';
import { ApiResponse } from '../models/api-response';
import { environment } from '../../environments/environment';

export interface UniversityApiItem {
  id: string;
  name: string;
  shortName: string;
  isActive: boolean;
}

interface CrudFeedbackOptions {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

@Injectable({
  providedIn: 'root'
})
export class UniversityService {
  private readonly http = inject(HttpClient);
  private readonly universitiesApiUrl = `${environment.backendUrl}/v1/universities`;

  private _universities = signal<University[]>([]);

  constructor() {
    this.refreshUniversities();
  }

  // Computed signals
  readonly universities = computed(() => this._universities());
  readonly activeUniversities = computed(() => this._universities().filter(u => u.isActive));
  readonly publicUniversities = computed(() => this._universities().filter(u => u.isPublic && u.isActive));

  readonly universitiesByStatus = computed(() => {
    const unis = this._universities();
    return {
      activo: unis.filter(u => u.membershipStatus === 'activo'),
      pendiente: unis.filter(u => u.membershipStatus === 'pendiente'),
      en_proceso: unis.filter(u => u.membershipStatus === 'en_proceso'),
      suspendido: unis.filter(u => u.membershipStatus === 'suspendido'),
      inactivo: unis.filter(u => u.membershipStatus === 'inactivo')
    };
  });

  readonly universitiesByRegion = computed(() => {
    const unis = this._universities();
    const grouped: { [key: string]: University[] } = {};
    unis.forEach(u => {
      if (!grouped[u.region]) {
        grouped[u.region] = [];
      }
      grouped[u.region].push(u);
    });
    return grouped;
  });

  getUniversitiesApi(): Observable<ApiResponse<UniversityApiItem[]>> {
    return this.http
      .get<ApiResponse<unknown>>(this.universitiesApiUrl)
      .pipe(
        map(response => ({
          ...response,
          data: this.mapUniversitiesToApiItems(response.data)
        }))
      );
  }

  refreshUniversities(): void {
    this.http.get<ApiResponse<unknown>>(this.universitiesApiUrl).subscribe({
      next: response => {
        const universities = this.mapUniversitiesFromApi(response.data);
        this._universities.set(universities);
      },
      error: error => {
        console.error('No se pudieron cargar las universidades desde la API.', error);
      }
    });
  }

  // CRUD Universidades
  getUniversityById(id: string): University | undefined {
    return this._universities().find(u => u.id === id);
  }

  addUniversity(university: University, options?: CrudFeedbackOptions): void {
    const payload = this.buildUniversityPayload(university);
    this.http.post<ApiResponse<unknown>>(this.universitiesApiUrl, payload).subscribe({
      next: () => {
        this.refreshUniversities();
        options?.onSuccess?.();
      },
      error: error => {
        const message = this.normalizeApiErrorMessage(error);
        console.error('No se pudo crear la universidad en la API.', error);
        options?.onError?.(message);
      }
    });
  }

  updateUniversity(id: string, updates: Partial<University>, options?: CrudFeedbackOptions): void {
    const payload = this.buildUniversityPayload(updates);
    payload['id'] = id;

    this.http.patch<ApiResponse<unknown>>(`${this.universitiesApiUrl}/${id}`, payload).subscribe({
      next: () => {
        this.refreshUniversities();
        options?.onSuccess?.();
      },
      error: error => {
        const message = this.normalizeApiErrorMessage(error);
        console.error('No se pudo actualizar la universidad en la API.', error);
        options?.onError?.(message);
      }
    });
  }

  deleteUniversity(id: string, options?: CrudFeedbackOptions): void {
    this.http.delete<ApiResponse<unknown>>(`${this.universitiesApiUrl}/${id}`).subscribe({
      next: () => {
        this.refreshUniversities();
        options?.onSuccess?.();
      },
      error: error => {
        const message = this.normalizeApiErrorMessage(error);
        console.error('No se pudo eliminar la universidad en la API.', error);
        options?.onError?.(message);
      }
    });
  }

  // Gestión de Autoridades
  addAuthority(universityId: string, authority: Authority): void {
    this._universities.update(unis =>
      unis.map(u => {
        if (u.id === universityId) {
          return { ...u, authorities: [...u.authorities, authority], updatedAt: new Date() };
        }
        return u;
      })
    );
  }

  updateAuthority(universityId: string, authorityId: string, updates: Partial<Authority>): void {
    this._universities.update(unis =>
      unis.map(u => {
        if (u.id === universityId) {
          return {
            ...u,
            authorities: u.authorities.map(a =>
              a.id === authorityId ? { ...a, ...updates } : a
            ),
            updatedAt: new Date()
          };
        }
        return u;
      })
    );
  }

  removeAuthority(universityId: string, authorityId: string): void {
    this._universities.update(unis =>
      unis.map(u => {
        if (u.id === universityId) {
          return {
            ...u,
            authorities: u.authorities.filter(a => a.id !== authorityId),
            updatedAt: new Date()
          };
        }
        return u;
      })
    );
  }

  // Gestión de Equipo Técnico
  addTeamMember(universityId: string, member: TechnicalTeamMember): void {
    this._universities.update(unis =>
      unis.map(u => {
        if (u.id === universityId) {
          return { ...u, technicalTeam: [...u.technicalTeam, member], updatedAt: new Date() };
        }
        return u;
      })
    );
  }

  updateTeamMember(universityId: string, memberId: string, updates: Partial<TechnicalTeamMember>): void {
    this._universities.update(unis =>
      unis.map(u => {
        if (u.id === universityId) {
          return {
            ...u,
            technicalTeam: u.technicalTeam.map(m =>
              m.id === memberId ? { ...m, ...updates } : m
            ),
            updatedAt: new Date()
          };
        }
        return u;
      })
    );
  }

  removeTeamMember(universityId: string, memberId: string): void {
    this._universities.update(unis =>
      unis.map(u => {
        if (u.id === universityId) {
          return {
            ...u,
            technicalTeam: u.technicalTeam.filter(m => m.id !== memberId),
            updatedAt: new Date()
          };
        }
        return u;
      })
    );
  }

  // Gestión de Reportes
  addReport(universityId: string, report: UniversityReport): void {
    this._universities.update(unis =>
      unis.map(u => {
        if (u.id === universityId) {
          return { ...u, reports: [...u.reports, report], updatedAt: new Date() };
        }
        return u;
      })
    );
  }

  updateReport(universityId: string, reportId: string, updates: Partial<UniversityReport>): void {
    this._universities.update(unis =>
      unis.map(u => {
        if (u.id === universityId) {
          return {
            ...u,
            reports: u.reports.map(r =>
              r.id === reportId ? { ...r, ...updates } : r
            ),
            updatedAt: new Date()
          };
        }
        return u;
      })
    );
  }

  removeReport(universityId: string, reportId: string): void {
    this._universities.update(unis =>
      unis.map(u => {
        if (u.id === universityId) {
          return {
            ...u,
            reports: u.reports.filter(r => r.id !== reportId),
            updatedAt: new Date()
          };
        }
        return u;
      })
    );
  }

  deleteReport(universityId: string, reportId: string): void {
    this.removeReport(universityId, reportId);
  }

  // Alias methods for technical team (compatibilidad con componentes)
  addTechnicalTeamMember(universityId: string, member: TechnicalTeamMember): void {
    this.addTeamMember(universityId, member);
  }

  updateTechnicalTeamMember(universityId: string, memberId: string, updates: Partial<TechnicalTeamMember>): void {
    this.updateTeamMember(universityId, memberId, updates);
  }

  removeTechnicalTeamMember(universityId: string, memberId: string): void {
    this.removeTeamMember(universityId, memberId);
  }

  // Búsqueda y filtrado
  searchUniversities(query: string): University[] {
    const lowerQuery = query.toLowerCase();
    return this._universities().filter(u =>
      u.name.toLowerCase().includes(lowerQuery) ||
      u.shortName.toLowerCase().includes(lowerQuery) ||
      u.city.toLowerCase().includes(lowerQuery) ||
      u.region.toLowerCase().includes(lowerQuery)
    );
  }

  private mapUniversitiesFromApi(data: unknown): University[] {
    const items = this.extractItems(data);
    return items.map(item => this.mapUniversity(item));
  }

  private mapUniversitiesToApiItems(data: unknown): UniversityApiItem[] {
    return this.mapUniversitiesFromApi(data).map(university => ({
      id: university.id,
      name: university.name,
      shortName: university.shortName,
      isActive: university.isActive
    }));
  }

  private extractItems(data: unknown): unknown[] {
    if (Array.isArray(data)) {
      return data;
    }

    if (!this.isRecord(data)) {
      return [];
    }

    const items = data['items'];
    if (Array.isArray(items)) {
      return items;
    }

    const results = data['results'];
    if (Array.isArray(results)) {
      return results;
    }

    return [];
  }

  private mapUniversity(item: unknown): University {
    const source = this.isRecord(item) ? item : {};
    const now = new Date();
    const isActive = this.toBooleanValue(source['isActive'], true);

    return {
      id: this.toStringValue(source['id']) ?? crypto.randomUUID(),
      name: this.toStringValue(source['name']) ?? '',
      shortName: this.toStringValue(source['shortName']) ?? '',
      logoUrl: this.toStringValue(source['logoUrl']),
      websiteUrl: this.toStringValue(source['websiteUrl']),
      address: this.toStringValue(source['address']),
      city: this.toStringValue(source['city']) ?? '',
      region: this.toStringValue(source['region']) ?? '',
      foundedYear: this.toNumberValue(source['foundedYear']),
      membershipStatus: this.toMembershipStatus(source['membershipStatus'], isActive),
      membershipDate: this.toDateValue(source['membershipDate']),
      certificateNumber: this.toStringValue(source['certificateNumber']),
      certificateFileUrl: this.toStringValue(source['certificateFileUrl']),
      authorities: this.toArray<Authority>(source['authorities']),
      technicalTeam: this.toArray<TechnicalTeamMember>(source['technicalTeam']),
      reports: this.toArray<UniversityReport>(source['reports']),
      isActive,
      isPublic: this.toBooleanValue(source['isPublic'], true),
      createdAt: this.toDateValue(source['createdAt']) ?? now,
      updatedAt: this.toDateValue(source['updatedAt']) ?? now,
      createdBy: this.toStringValue(source['createdBy']) ?? 'sistema',
      updatedBy: this.toStringValue(source['updatedBy']) ?? 'sistema'
    };
  }

  private buildUniversityPayload(source: Partial<University>): Record<string, unknown> {
    const payload: Record<string, unknown> = {};

    this.setIfDefined(payload, 'name', source.name);
    this.setIfDefined(payload, 'shortName', source.shortName);
    this.setIfDefined(payload, 'logoUrl', source.logoUrl);
    this.setIfDefined(payload, 'websiteUrl', source.websiteUrl);
    this.setIfDefined(payload, 'address', source.address);
    this.setIfDefined(payload, 'city', source.city);
    this.setIfDefined(payload, 'region', source.region);
    this.setIfDefined(payload, 'foundedYear', source.foundedYear);
    this.setIfDefined(payload, 'certificateNumber', source.certificateNumber);
    this.setIfDefined(payload, 'certificateFileUrl', source.certificateFileUrl);
    this.setIfDefined(payload, 'isActive', source.isActive);
    this.setIfDefined(payload, 'isPublic', source.isPublic);

    if (source.membershipDate !== undefined) {
      payload['membershipDate'] = source.membershipDate
        ? this.toApiDate(source.membershipDate)
        : null;
    }

    if (this.isUuid(source.createdBy)) {
      payload['createdBy'] = source.createdBy;
    }

    if (this.isUuid(source.updatedBy)) {
      payload['updatedBy'] = source.updatedBy;
    }

    return payload;
  }

  private setIfDefined(payload: Record<string, unknown>, key: string, value: unknown): void {
    if (value !== undefined) {
      payload[key] = value;
    }
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private toArray<T>(value: unknown): T[] {
    return Array.isArray(value) ? (value as T[]) : [];
  }

  private toStringValue(value: unknown): string | undefined {
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value.toString();
    }
    return undefined;
  }

  private toNumberValue(value: unknown): number | undefined {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
  }

  private toBooleanValue(value: unknown, defaultValue: boolean): boolean {
    return typeof value === 'boolean' ? value : defaultValue;
  }

  private toDateValue(value: unknown): Date | undefined {
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? undefined : value;
    }

    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? undefined : date;
    }

    return undefined;
  }

  private toMembershipStatus(value: unknown, isActive: boolean): University['membershipStatus'] {
    const allowedStatuses: University['membershipStatus'][] = [
      'pendiente',
      'en_proceso',
      'activo',
      'suspendido',
      'inactivo'
    ];

    return typeof value === 'string' && allowedStatuses.includes(value as University['membershipStatus'])
      ? (value as University['membershipStatus'])
      : (isActive ? 'activo' : 'inactivo');
  }

  private toApiDate(value: Date): string {
    const date = new Date(value);
    return date.toISOString().split('T')[0];
  }

  private isUuid(value: unknown): value is string {
    if (typeof value !== 'string') {
      return false;
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    return uuidRegex.test(value);
  }

  private normalizeApiErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const backendMessage =
        error.error?.message ||
        error.error?.title ||
        error.error?.detail ||
        'No se pudo completar la operación en universidades.';

      return backendMessage;
    }

    return 'Ocurrió un error inesperado en universidades.';
  }
}
