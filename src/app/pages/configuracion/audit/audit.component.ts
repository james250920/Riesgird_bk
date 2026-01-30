import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services';
import { IconComponent } from '../../../shared/icons/icons.component';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.scss'
})
export class AuditComponent {
  authService = inject(AuthService);

  selectedModule = signal<string>('all');
  selectedAction = signal<string>('all');
  searchTerm = signal<string>('');

  filteredLogs = computed(() => {
    let logs = this.authService.auditLogs();

    if (this.selectedModule() !== 'all') {
      logs = logs.filter(l => l.module === this.selectedModule());
    }

    if (this.selectedAction() !== 'all') {
      logs = logs.filter(l => l.action === this.selectedAction());
    }

    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      logs = logs.filter(l =>
        l.userName.toLowerCase().includes(term) ||
        l.action.toLowerCase().includes(term) ||
        l.module.toLowerCase().includes(term)
      );
    }

    return logs;
  });

  clearFilters(): void {
    this.selectedModule.set('all');
    this.selectedAction.set('all');
    this.searchTerm.set('');
  }

  exportLogs(): void {
    console.log('Exportar logs de auditoría');
    // Aquí se implementaría la exportación a CSV o Excel
  }
}
