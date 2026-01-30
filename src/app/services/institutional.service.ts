import { Injectable, signal, computed } from '@angular/core';
import { InstitutionalContent, NormativeDocument, Ally } from '../models';

@Injectable({
  providedIn: 'root'
})
export class InstitutionalService {

  // Signals para contenido institucional
  private _contents = signal<InstitutionalContent[]>([
    {
      id: '1',
      type: 'mision',
      title: 'Misión',
      content: '<p>La RIESGIRD-ACC PERÚ tiene como misión fortalecer las capacidades institucionales de las universidades peruanas en la gestión integral del riesgo de desastres y adaptación al cambio climático.</p>',
      isPublic: true,
      lastUpdated: new Date(),
      updatedBy: 'admin'
    },
    {
      id: '2',
      type: 'vision',
      title: 'Visión',
      content: '<p>Ser la red interuniversitaria líder en Latinoamérica en la generación de conocimiento y formación de profesionales especializados en gestión del riesgo de desastres y cambio climático.</p>',
      isPublic: true,
      lastUpdated: new Date(),
      updatedBy: 'admin'
    },
    {
      id: '3',
      type: 'objetivos',
      title: 'Objetivos',
      content: '<ul><li>Promover la investigación científica en GIRD-ACC</li><li>Fortalecer la formación académica especializada</li><li>Desarrollar programas de extensión universitaria</li></ul>',
      isPublic: true,
      lastUpdated: new Date(),
      updatedBy: 'admin'
    },
    {
      id: '4',
      type: 'lineamientos',
      title: 'Lineamientos',
      content: '<p>Los lineamientos estratégicos de la red se basan en los principios de colaboración interinstitucional, excelencia académica y compromiso social.</p>',
      isPublic: true,
      lastUpdated: new Date(),
      updatedBy: 'admin'
    }
  ]);

  private _documents = signal<NormativeDocument[]>([]);
  private _allies = signal<Ally[]>([]);

  // Computed signals
  readonly contents = computed(() => this._contents());
  readonly documents = computed(() => this._documents());
  readonly allies = computed(() => this._allies());
  readonly activeAllies = computed(() => this._allies().filter(a => a.isActive));
  readonly publicContents = computed(() => this._contents().filter(c => c.isPublic));

  // Métodos para contenido institucional
  getContentByType(type: InstitutionalContent['type']): InstitutionalContent | undefined {
    return this._contents().find(c => c.type === type);
  }

  updateContent(id: string, updates: Partial<InstitutionalContent>): void {
    this._contents.update(contents =>
      contents.map(c => c.id === id ? { ...c, ...updates, lastUpdated: new Date() } : c)
    );
  }

  // Métodos para documentos normativos
  addDocument(document: NormativeDocument): void {
    this._documents.update(docs => [...docs, document]);
  }

  updateDocument(id: string, updates: Partial<NormativeDocument>): void {
    this._documents.update(docs =>
      docs.map(d => d.id === id ? { ...d, ...updates } : d)
    );
  }

  deleteDocument(id: string): void {
    this._documents.update(docs => docs.filter(d => d.id !== id));
  }

  getActiveDocuments(): NormativeDocument[] {
    return this._documents().filter(d => d.isActive);
  }

  // Métodos para aliados
  addAlly(ally: Ally): void {
    this._allies.update(allies => [...allies, ally]);
  }

  updateAlly(id: string, updates: Partial<Ally>): void {
    this._allies.update(allies =>
      allies.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a)
    );
  }

  deleteAlly(id: string): void {
    this._allies.update(allies => allies.filter(a => a.id !== id));
  }

  reorderAllies(allyIds: string[]): void {
    this._allies.update(allies => {
      return allyIds.map((id, index) => {
        const ally = allies.find(a => a.id === id);
        return ally ? { ...ally, order: index } : null;
      }).filter(Boolean) as Ally[];
    });
  }
}
