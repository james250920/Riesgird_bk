import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { University, Authority, TechnicalTeamMember, UniversityReport } from '../models';
import { ApiResponse } from '../models/api-response';
import { environment } from '../../environments/environment';

export interface UniversityApiItem {
  id: string;
  name: string;
  shortName: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UniversityService {
  private readonly http = inject(HttpClient);
  private readonly universitiesApiUrl = `${environment.backendUrl}/v1/universities`;

  private _universities = signal<University[]>([
    {
      id: '1',
      name: 'Universidad Nacional Mayor de San Marcos',
      shortName: 'UNMSM',
      city: 'Lima',
      region: 'Lima',
      membershipStatus: 'activo',
      membershipDate: new Date('2024-01-15'),
      authorities: [],
      technicalTeam: [],
      reports: [],
      isActive: true,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: '2',
      name: 'Universidad Nacional de Ingeniería',
      shortName: 'UNI',
      city: 'Lima',
      region: 'Lima',
      membershipStatus: 'activo',
      membershipDate: new Date('2024-02-20'),
      authorities: [],
      technicalTeam: [],
      reports: [],
      isActive: true,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
      updatedBy: 'admin'
    }
  ]);

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
    return this.http.get<ApiResponse<UniversityApiItem[]>>(this.universitiesApiUrl);
  }

  // CRUD Universidades
  getUniversityById(id: string): University | undefined {
    return this._universities().find(u => u.id === id);
  }

  addUniversity(university: University): void {
    this._universities.update(unis => [...unis, university]);
  }

  updateUniversity(id: string, updates: Partial<University>): void {
    this._universities.update(unis =>
      unis.map(u => u.id === id ? { ...u, ...updates, updatedAt: new Date() } : u)
    );
  }

  deleteUniversity(id: string): void {
    this._universities.update(unis => unis.filter(u => u.id !== id));
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
}
