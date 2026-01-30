import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MembershipService, UniversityService } from '../../../services';
import { MembershipApplication } from '../../../models';
import { IconComponent } from '../../../shared/icons/icons.component';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './applications.component.html',
  styleUrl: './applications.component.scss'
})
export class ApplicationsComponent {
  membershipService = inject(MembershipService);
  universityService = inject(UniversityService);

  searchQuery = '';
  statusFilter = 'all';
  showUrgent = false;

  showModal = signal(false);
  editingApplication = signal<MembershipApplication | null>(null);

  pipelineStages = [
    { status: 'pendiente', label: 'Pendiente', icon: 'inbox' },
    { status: 'en_revision', label: 'En Revisión', icon: 'search' },
    { status: 'documentacion_incompleta', label: 'Doc. Incompleta', icon: 'file-text' },
    { status: 'aprobada', label: 'Aprobada', icon: 'check-circle' },
    { status: 'rechazada', label: 'Rechazada', icon: 'x-circle' }
  ];

  formData = {
    universityName: '',
    contactName: '',
    contactPosition: '',
    contactEmail: '',
    contactPhone: '',
    status: 'pendiente' as MembershipApplication['status'],
    assignedTo: '',
    notes: ''
  };

  applications = this.membershipService.applications;
  filteredApplications = signal<MembershipApplication[]>([]);

  constructor() {
    this.applyFilters();
  }

  getStatusCount(status: string): number {
    return this.applications().filter(a => a.status === status).length;
  }

  applyFilters(): void {
    let result = this.applications();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(a =>
        a.universityName.toLowerCase().includes(query) ||
        (a.contactName?.toLowerCase().includes(query)) ||
        (a.applicationNumber?.toLowerCase().includes(query))
      );
    }

    if (this.statusFilter !== 'all') {
      result = result.filter(a => a.status === this.statusFilter);
    }

    if (this.showUrgent) {
      result = result.filter(a => this.isOverdue(a));
    }

    this.filteredApplications.set(result);
  }

  filterByStatus(status: string): void {
    if (this.statusFilter === status) {
      this.statusFilter = 'all';
    } else {
      this.statusFilter = status;
    }
    this.applyFilters();
  }

  toggleUrgent(): void {
    this.showUrgent = !this.showUrgent;
    this.applyFilters();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pendiente: 'Pendiente',
      en_revision: 'En revisión',
      documentacion_incompleta: 'Doc. incompleta',
      aprobada: 'Aprobada',
      rechazada: 'Rechazada'
    };
    return labels[status] || status;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  isOverdue(application: MembershipApplication): boolean {
    if (application.status === 'aprobada' || application.status === 'rechazada') return false;
    if (!application.submittedAt) return false;
    const daysSinceSubmission = Math.floor(
      (new Date().getTime() - new Date(application.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceSubmission > 30;
  }

  getDocumentsProgress(application: MembershipApplication): number {
    if (application.documents.length === 0) return 0;
    const approved = application.documents.filter(d => d.isValid || d.status === 'aprobado').length;
    return Math.round((approved / application.documents.length) * 100);
  }

  viewDetails(application: MembershipApplication): void {
    // Navegar a detalles
    alert(`Ver detalles de: ${application.universityName}`);
  }

  startReview(application: MembershipApplication): void {
    this.membershipService.updateApplication(application.id, {
      status: 'en_revision',
      reviewStartedAt: new Date()
    });
    this.applyFilters();
  }

  approveApplication(application: MembershipApplication): void {
    if (confirm(`¿Aprobar la solicitud de ${application.universityName}?`)) {
      this.membershipService.updateApplication(application.id, {
        status: 'aprobada',
        reviewCompletedAt: new Date()
      });
      this.applyFilters();
    }
  }

  rejectApplication(application: MembershipApplication): void {
    const reason = prompt('Motivo del rechazo:');
    if (reason) {
      this.membershipService.updateApplication(application.id, {
        status: 'rechazada',
        rejectionReason: reason,
        reviewCompletedAt: new Date()
      });
      this.applyFilters();
    }
  }

  markIncomplete(application: MembershipApplication): void {
    this.membershipService.updateApplication(application.id, {
      status: 'documentacion_incompleta'
    });
    this.applyFilters();
  }

  assignApplication(application: MembershipApplication): void {
    const reviewer = prompt('Nombre del revisor:');
    if (reviewer) {
      this.membershipService.updateApplication(application.id, {
        assignedTo: reviewer
      });
      this.applyFilters();
    }
  }

  openModal(): void {
    this.resetForm();
    this.showModal.set(true);
  }

  editApplication(application: MembershipApplication): void {
    this.editingApplication.set(application);
    this.formData = {
      universityName: application.universityName,
      contactName: application.contactName || '',
      contactPosition: application.contactPosition || '',
      contactEmail: application.contactEmail || '',
      contactPhone: application.contactPhone || '',
      status: application.status,
      assignedTo: application.assignedTo || '',
      notes: application.notes || ''
    };
    this.showModal.set(true);
  }

  deleteApplication(application: MembershipApplication): void {
    if (confirm(`¿Eliminar la solicitud de ${application.universityName}?`)) {
      this.membershipService.deleteApplication(application.id);
      this.applyFilters();
    }
  }

  saveApplication(): void {
    if (!this.formData.universityName || !this.formData.contactEmail) return;

    if (this.editingApplication()) {
      this.membershipService.updateApplication(this.editingApplication()!.id, {
        universityName: this.formData.universityName,
        contactName: this.formData.contactName,
        contactPosition: this.formData.contactPosition || undefined,
        contactEmail: this.formData.contactEmail,
        contactPhone: this.formData.contactPhone || undefined,
        status: this.formData.status,
        assignedTo: this.formData.assignedTo || undefined,
        notes: this.formData.notes || undefined,
        updatedAt: new Date()
      });
    } else {
      const newApplication: MembershipApplication = {
        id: crypto.randomUUID(),
        applicationNumber: `SOL-${new Date().getFullYear()}-${String(this.applications().length + 1).padStart(3, '0')}`,
        universityName: this.formData.universityName,
        applicantName: this.formData.contactName || 'Sin especificar',
        applicantEmail: this.formData.contactEmail,
        applicationDate: new Date(),
        contactName: this.formData.contactName || undefined,
        contactPosition: this.formData.contactPosition || undefined,
        contactEmail: this.formData.contactEmail || undefined,
        contactPhone: this.formData.contactPhone || undefined,
        status: 'recibida',
        statusHistory: [],
        assignedTo: this.formData.assignedTo || undefined,
        notes: this.formData.notes || undefined,
        documents: [],
        certificateAssigned: false,
        submittedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.membershipService.addApplication(newApplication);
    }

    this.closeModal();
    this.applyFilters();
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingApplication.set(null);
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      universityName: '',
      contactName: '',
      contactPosition: '',
      contactEmail: '',
      contactPhone: '',
      status: 'recibida',
      assignedTo: '',
      notes: ''
    };
  }
}
