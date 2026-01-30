import { Injectable, signal, computed } from '@angular/core';
import {
  MembershipRequirement,
  DownloadableTemplate,
  MembershipApplication,
  MembershipCertificate,
  ApplicationDocument,
  StatusChange
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class MembershipService {

  private _requirements = signal<MembershipRequirement[]>([
    {
      id: '1',
      order: 1,
      title: 'Carta de solicitud de adscripción',
      description: 'Dirigida al Presidente de la RIESGIRD-ACC PERÚ, firmada por el Rector de la universidad solicitante.',
      category: 'documentacion',
      type: 'obligatorio',
      isRequired: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      order: 2,
      title: 'Resolución de designación de Secretario Técnico',
      description: 'Resolución rectoral que designa al Secretario Técnico de GIRD-ACC de la universidad.',
      category: 'legal',
      type: 'obligatorio',
      isRequired: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      order: 3,
      title: 'Resolución de conformación del Comité Técnico Interáreas',
      description: 'Resolución rectoral que conforma el Comité Técnico Interáreas de GIRD-ACC.',
      category: 'legal',
      type: 'obligatorio',
      isRequired: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      order: 4,
      title: 'Aceptación del Estatuto de la Red',
      description: 'Declaración de aceptación de los términos del Estatuto de la RIESGIRD-ACC PERÚ.',
      category: 'documentacion',
      type: 'obligatorio',
      isRequired: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  private _templates = signal<DownloadableTemplate[]>([]);
  private _applications = signal<MembershipApplication[]>([]);
  private _certificates = signal<MembershipCertificate[]>([]);

  // Computed signals
  readonly requirements = computed(() => this._requirements());
  readonly activeRequirements = computed(() =>
    this._requirements()
      .filter(r => r.isActive)
      .sort((a, b) => a.order - b.order)
  );
  readonly templates = computed(() => this._templates());
  readonly activeTemplates = computed(() => this._templates().filter(t => t.isActive));
  readonly applications = computed(() => this._applications());
  readonly certificates = computed(() => this._certificates());

  readonly applicationsByStatus = computed(() => {
    const apps = this._applications();
    return {
      recibida: apps.filter(a => a.status === 'recibida'),
      en_revision: apps.filter(a => a.status === 'en_revision'),
      documentos_pendientes: apps.filter(a => a.status === 'documentos_pendientes'),
      aprobada: apps.filter(a => a.status === 'aprobada'),
      rechazada: apps.filter(a => a.status === 'rechazada')
    };
  });

  // CRUD Requisitos
  addRequirement(requirement: MembershipRequirement): void {
    this._requirements.update(reqs => [...reqs, requirement]);
  }

  updateRequirement(id: string, updates: Partial<MembershipRequirement>): void {
    this._requirements.update(reqs =>
      reqs.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r)
    );
  }

  deleteRequirement(id: string): void {
    this._requirements.update(reqs => reqs.filter(r => r.id !== id));
  }

  reorderRequirements(ids: string[]): void {
    this._requirements.update(reqs => {
      return ids.map((id, index) => {
        const req = reqs.find(r => r.id === id);
        return req ? { ...req, order: index + 1 } : null;
      }).filter(Boolean) as MembershipRequirement[];
    });
  }

  // CRUD Plantillas
  addTemplate(template: DownloadableTemplate): void {
    this._templates.update(temps => [...temps, template]);
  }

  updateTemplate(id: string, updates: Partial<DownloadableTemplate>): void {
    this._templates.update(temps =>
      temps.map(t => t.id === id ? { ...t, ...updates } : t)
    );
  }

  deleteTemplate(id: string): void {
    this._templates.update(temps => temps.filter(t => t.id !== id));
  }

  getTemplateByType(type: DownloadableTemplate['type']): DownloadableTemplate | undefined {
    return this._templates().find(t => t.type === type && t.isActive);
  }

  // CRUD Solicitudes
  addApplication(application: MembershipApplication): void {
    this._applications.update(apps => [...apps, application]);
  }

  updateApplication(id: string, updates: Partial<MembershipApplication>): void {
    this._applications.update(apps =>
      apps.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a)
    );
  }

  changeApplicationStatus(
    id: string,
    newStatus: MembershipApplication['status'],
    changedBy: string,
    notes?: string
  ): void {
    this._applications.update(apps =>
      apps.map(a => {
        if (a.id === id) {
          const statusChange: StatusChange = {
            status: newStatus,
            date: new Date(),
            changedBy,
            notes
          };
          return {
            ...a,
            status: newStatus,
            statusHistory: [...a.statusHistory, statusChange],
            updatedAt: new Date()
          };
        }
        return a;
      })
    );
  }

  addDocumentToApplication(applicationId: string, document: ApplicationDocument): void {
    this._applications.update(apps =>
      apps.map(a => {
        if (a.id === applicationId) {
          return {
            ...a,
            documents: [...a.documents, document],
            updatedAt: new Date()
          };
        }
        return a;
      })
    );
  }

  validateDocument(
    applicationId: string,
    documentId: string,
    isValid: boolean,
    validatedBy: string,
    notes?: string
  ): void {
    this._applications.update(apps =>
      apps.map(a => {
        if (a.id === applicationId) {
          return {
            ...a,
            documents: a.documents.map(d =>
              d.id === documentId
                ? { ...d, isValid, validatedBy, validatedAt: new Date(), validationNotes: notes }
                : d
            ),
            updatedAt: new Date()
          };
        }
        return a;
      })
    );
  }

  // CRUD Certificados
  generateCertificate(certificate: MembershipCertificate): void {
    this._certificates.update(certs => [...certs, certificate]);

    // También actualizar la solicitud correspondiente
    const app = this._applications().find(a => a.universityId === certificate.universityId);
    if (app) {
      this.updateApplication(app.id, {
        certificateAssigned: true,
        certificateNumber: certificate.certificateNumber,
        certificateDate: certificate.issueDate
      });
    }
  }

  revokeCertificate(id: string): void {
    this._certificates.update(certs =>
      certs.map(c => c.id === id ? { ...c, isActive: false } : c)
    );
  }

  getCertificateByUniversity(universityId: string): MembershipCertificate | undefined {
    return this._certificates().find(c => c.universityId === universityId && c.isActive);
  }

  deleteApplication(id: string): void {
    this._applications.update(apps => apps.filter(a => a.id !== id));
  }
}
