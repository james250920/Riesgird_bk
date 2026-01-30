import { Injectable, signal, computed } from '@angular/core';
import {
  Researcher,
  Publication,
  Expert,
  SpecializationProgram,
  Brigade
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class KnowledgeService {

  private _researchers = signal<Researcher[]>([]);
  private _experts = signal<Expert[]>([]);
  private _programs = signal<SpecializationProgram[]>([]);
  private _brigades = signal<Brigade[]>([]);

  // Computed signals
  readonly researchers = computed(() => this._researchers());
  readonly experts = computed(() => this._experts());
  readonly programs = computed(() => this._programs());
  readonly brigades = computed(() => this._brigades());

  readonly activeResearchers = computed(() =>
    this._researchers().filter(r => r.isActive)
  );

  readonly researchersByUniversity = computed(() => {
    const researchers = this._researchers();
    const grouped: { [key: string]: Researcher[] } = {};
    researchers.forEach(r => {
      if (!grouped[r.universityId]) {
        grouped[r.universityId] = [];
      }
      grouped[r.universityId].push(r);
    });
    return grouped;
  });

  readonly researchersByArea = computed(() => {
    const researchers = this._researchers();
    const grouped: { [key: string]: Researcher[] } = {};
    researchers.forEach(r => {
      r.researchAreas.forEach(area => {
        if (!grouped[area]) {
          grouped[area] = [];
        }
        grouped[area].push(r);
      });
    });
    return grouped;
  });

  readonly activeExperts = computed(() =>
    this._experts().filter(e => e.isActive)
  );

  readonly expertsBySpecialty = computed(() => {
    const experts = this._experts();
    const grouped: { [key: string]: Expert[] } = {};
    experts.forEach(e => {
      e.expertiseAreas.forEach(area => {
        if (!grouped[area]) {
          grouped[area] = [];
        }
        grouped[area].push(e);
      });
    });
    return grouped;
  });

  readonly activePrograms = computed(() =>
    this._programs().filter(p =>
      p.status !== 'cancelado' && p.status !== 'finalizado'
    )
  );

  readonly activeBrigades = computed(() =>
    this._brigades().filter(b => b.isActive)
  );

  readonly brigadesByUniversity = computed(() => {
    const brigades = this._brigades();
    const grouped: { [key: string]: Brigade[] } = {};
    brigades.forEach(b => {
      if (!grouped[b.universityId]) {
        grouped[b.universityId] = [];
      }
      grouped[b.universityId].push(b);
    });
    return grouped;
  });

  // CRUD Investigadores
  addResearcher(researcher: Researcher): void {
    this._researchers.update(researchers => [...researchers, researcher]);
  }

  updateResearcher(id: string, updates: Partial<Researcher>): void {
    this._researchers.update(researchers =>
      researchers.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r)
    );
  }

  deleteResearcher(id: string): void {
    this._researchers.update(researchers => researchers.filter(r => r.id !== id));
  }

  getResearcherById(id: string): Researcher | undefined {
    return this._researchers().find(r => r.id === id);
  }

  // Gestión de Publicaciones
  addPublication(researcherId: string, publication: Publication): void {
    this._researchers.update(researchers =>
      researchers.map(r => {
        if (r.id === researcherId) {
          return { ...r, publications: [...(r.publications || []), publication], updatedAt: new Date() };
        }
        return r;
      })
    );
  }

  updatePublication(researcherId: string, publicationId: string, updates: Partial<Publication>): void {
    this._researchers.update(researchers =>
      researchers.map(r => {
        if (r.id === researcherId) {
          return {
            ...r,
            publications: (r.publications || []).map(p =>
              p.id === publicationId ? { ...p, ...updates } : p
            ),
            updatedAt: new Date()
          };
        }
        return r;
      })
    );
  }

  removePublication(researcherId: string, publicationId: string): void {
    this._researchers.update(researchers =>
      researchers.map(r => {
        if (r.id === researcherId) {
          return {
            ...r,
            publications: (r.publications || []).filter(p => p.id !== publicationId),
            updatedAt: new Date()
          };
        }
        return r;
      })
    );
  }

  // CRUD Expertos
  addExpert(expert: Expert): void {
    this._experts.update(experts => [...experts, expert]);
  }

  updateExpert(id: string, updates: Partial<Expert>): void {
    this._experts.update(experts =>
      experts.map(e => e.id === id ? { ...e, ...updates, updatedAt: new Date() } : e)
    );
  }

  deleteExpert(id: string): void {
    this._experts.update(experts => experts.filter(e => e.id !== id));
  }

  getExpertById(id: string): Expert | undefined {
    return this._experts().find(e => e.id === id);
  }

  // CRUD Programas
  addProgram(program: SpecializationProgram): void {
    this._programs.update(programs => [...programs, program]);
  }

  updateProgram(id: string, updates: Partial<SpecializationProgram>): void {
    this._programs.update(programs =>
      programs.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p)
    );
  }

  deleteProgram(id: string): void {
    this._programs.update(programs => programs.filter(p => p.id !== id));
  }

  getProgramById(id: string): SpecializationProgram | undefined {
    return this._programs().find(p => p.id === id);
  }

  // CRUD Brigadas
  addBrigade(brigade: Brigade): void {
    this._brigades.update(brigades => [...brigades, brigade]);
  }

  updateBrigade(id: string, updates: Partial<Brigade>): void {
    this._brigades.update(brigades =>
      brigades.map(b => b.id === id ? { ...b, ...updates, updatedAt: new Date() } : b)
    );
  }

  deleteBrigade(id: string): void {
    this._brigades.update(brigades => brigades.filter(b => b.id !== id));
  }

  getBrigadeById(id: string): Brigade | undefined {
    return this._brigades().find(b => b.id === id);
  }

  // Búsquedas
  searchResearchers(query: string): Researcher[] {
    const lowerQuery = query.toLowerCase();
    return this._researchers().filter(r =>
      r.fullName.toLowerCase().includes(lowerQuery) ||
      (r.specialty?.toLowerCase().includes(lowerQuery) ?? false) ||
      r.researchAreas.some(area => area.toLowerCase().includes(lowerQuery))
    );
  }

  searchExperts(query: string): Expert[] {
    const lowerQuery = query.toLowerCase();
    return this._experts().filter(e =>
      e.fullName.toLowerCase().includes(lowerQuery) ||
      (e.specialtyInRiskGovernance?.toLowerCase().includes(lowerQuery) ?? false) ||
      e.expertiseAreas.some(area => area.toLowerCase().includes(lowerQuery))
    );
  }

  getAvailableExperts(): Expert[] {
    return this._experts().filter(e =>
      e.isActive &&
      (e.availableForConsulting || e.availableForTraining || e.availableForResearch)
    );
  }
}
