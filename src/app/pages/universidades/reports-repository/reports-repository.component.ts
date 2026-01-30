import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UniversityService } from '../../../services';
import { University, UniversityReport } from '../../../models';
import { IconComponent } from '../../../shared/icons/icons.component';

@Component({
  selector: 'app-reports-repository',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './reports-repository.component.html',
  styleUrl: './reports-repository.component.scss'
})
export class ReportsRepositoryComponent {
  universityService = inject(UniversityService);

  searchQuery = '';
  universityFilter = 'all';
  yearFilter = 'all';
  statusFilter = 'all';
  currentYear = new Date().getFullYear();

  showModal = signal(false);
  editingItem = signal<{ report: UniversityReport; university: University } | null>(null);

  formData = {
    universityId: '',
    year: this.currentYear,
    periodStart: '',
    periodEnd: '',
    title: '',
    description: '',
    documentUrl: '',
    submittedBy: '',
    status: 'borrador' as UniversityReport['status'],
    isPublic: false
  };

  universities = this.universityService.universities;

  allReports = computed(() => {
    const result: { report: UniversityReport; university: University }[] = [];
    for (const university of this.universities()) {
      for (const report of university.reports) {
        result.push({ report, university });
      }
    }
    return result;
  });

  filteredReports = signal<{ report: UniversityReport; university: University }[]>([]);

  availableYears = computed(() => {
    const years = new Set(this.allReports().map(r => r.report.year));
    return Array.from(years).sort((a, b) => b - a);
  });

  groupedByYear = computed(() => {
    const filtered = this.filteredReports();
    const grouped = new Map<number, { year: number; reports: { report: UniversityReport; university: University }[] }>();

    for (const item of filtered) {
      if (!grouped.has(item.report.year)) {
        grouped.set(item.report.year, { year: item.report.year, reports: [] });
      }
      grouped.get(item.report.year)!.reports.push(item);
    }

    return Array.from(grouped.values()).sort((a, b) => b.year - a.year);
  });

  totalReports = computed(() => this.allReports().length);
  publishedReports = computed(() => this.allReports().filter(r => r.report.status === 'publicado').length);
  pendingReports = computed(() => this.allReports().filter(r => r.report.status === 'en_revision').length);
  universitiesWithReports = computed(() => {
    const ids = new Set(this.allReports().map(r => r.university.id));
    return ids.size;
  });

  constructor() {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.allReports();

    if (this.universityFilter !== 'all') {
      result = result.filter(item => item.university.id === this.universityFilter);
    }

    if (this.yearFilter !== 'all') {
      result = result.filter(item => item.report.year === parseInt(this.yearFilter));
    }

    if (this.statusFilter !== 'all') {
      result = result.filter(item => item.report.status === this.statusFilter);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(item =>
        item.report.title.toLowerCase().includes(query) ||
        item.university.name.toLowerCase().includes(query)
      );
    }

    this.filteredReports.set(result);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'borrador': 'Borrador',
      'en_revision': 'En revisión',
      'aprobado': 'Aprobado',
      'publicado': 'Publicado'
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

  toggleVisibility(item: { report: UniversityReport; university: University }): void {
    this.universityService.updateReport(item.university.id, item.report.id, {
      isPublic: !item.report.isPublic
    });
    this.applyFilters();
  }

  approveReport(item: { report: UniversityReport; university: University }): void {
    if (confirm('¿Aprobar este reporte?')) {
      this.universityService.updateReport(item.university.id, item.report.id, {
        status: 'aprobado'
      });
      this.applyFilters();
    }
  }

  publishReport(item: { report: UniversityReport; university: University }): void {
    if (confirm('¿Publicar este reporte?')) {
      this.universityService.updateReport(item.university.id, item.report.id, {
        status: 'publicado',
        isPublic: true
      });
      this.applyFilters();
    }
  }

  openModal(): void {
    this.resetForm();
    this.showModal.set(true);
  }

  editReport(item: { report: UniversityReport; university: University }): void {
    this.editingItem.set(item);
    this.formData = {
      universityId: item.university.id,
      year: item.report.year,
      periodStart: item.report.periodStart || '',
      periodEnd: item.report.periodEnd || '',
      title: item.report.title,
      description: item.report.description || '',
      documentUrl: item.report.documentUrl || '',
      submittedBy: item.report.submittedBy || '',
      status: item.report.status,
      isPublic: item.report.isPublic
    };
    this.showModal.set(true);
  }

  deleteReport(item: { report: UniversityReport; university: University }): void {
    if (confirm(`¿Eliminar el reporte "${item.report.title}"?`)) {
      this.universityService.removeReport(item.university.id, item.report.id);
      this.applyFilters();
    }
  }

  saveReport(): void {
    if (!this.formData.universityId || !this.formData.title) return;

    const reportData: UniversityReport = {
      id: this.editingItem()?.report.id || crypto.randomUUID(),
      universityId: this.formData.universityId,
      year: this.formData.year,
      periodStart: this.formData.periodStart || undefined,
      periodEnd: this.formData.periodEnd || undefined,
      title: this.formData.title,
      description: this.formData.description || undefined,
      documentUrl: this.formData.documentUrl || undefined,
      submittedBy: this.formData.submittedBy || undefined,
      submittedAt: new Date(),
      status: this.formData.status,
      isPublic: this.formData.isPublic
    };

    if (this.editingItem()) {
      this.universityService.updateReport(
        this.formData.universityId,
        reportData.id,
        reportData
      );
    } else {
      this.universityService.addReport(this.formData.universityId, reportData);
    }

    this.closeModal();
    this.applyFilters();
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingItem.set(null);
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      universityId: '',
      year: this.currentYear,
      periodStart: '',
      periodEnd: '',
      title: '',
      description: '',
      documentUrl: '',
      submittedBy: '',
      status: 'borrador',
      isPublic: false
    };
  }
}
