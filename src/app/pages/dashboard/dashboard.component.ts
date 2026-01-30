import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UniversityService, MembershipService, GovernanceService, KnowledgeService } from '../../services';
import { IconComponent } from '../../shared/icons/icons.component';

interface StatCard {
  title: string;
  value: number | string;
  icon: string;
  trend?: { value: number; isPositive: boolean };
  color: string;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  universityService = inject(UniversityService);
  membershipService = inject(MembershipService);
  governanceService = inject(GovernanceService);
  knowledgeService = inject(KnowledgeService);

  stats = computed<StatCard[]>(() => [
    {
      title: 'Universidades Activas',
      value: this.universityService.activeUniversities().length,
      icon: 'university',
      trend: { value: 12, isPositive: true },
      color: '#4299e1'
    },
    {
      title: 'Solicitudes Pendientes',
      value: this.membershipService.applicationsByStatus().recibida.length,
      icon: 'mail',
      color: '#ed8936'
    },
    {
      title: 'Investigadores',
      value: this.knowledgeService.activeResearchers().length,
      icon: 'research',
      trend: { value: 8, isPositive: true },
      color: '#38a169'
    },
    {
      title: 'Eventos Programados',
      value: this.governanceService.upcomingEvents().length,
      icon: 'calendar',
      color: '#805ad5'
    }
  ]);

  membershipStatuses = computed(() => {
    const statuses = this.universityService.universitiesByStatus();
    const total = Object.values(statuses).reduce((acc, arr) => acc + arr.length, 0) || 1;

    return [
      { label: 'Activo', count: statuses.activo.length, color: '#38a169', percentage: (statuses.activo.length / total) * 100 },
      { label: 'En Proceso', count: statuses.en_proceso.length, color: '#4299e1', percentage: (statuses.en_proceso.length / total) * 100 },
      { label: 'Pendiente', count: statuses.pendiente.length, color: '#ed8936', percentage: (statuses.pendiente.length / total) * 100 },
      { label: 'Suspendido', count: statuses.suspendido.length, color: '#e53e3e', percentage: (statuses.suspendido.length / total) * 100 },
      { label: 'Inactivo', count: statuses.inactivo.length, color: '#a0aec0', percentage: (statuses.inactivo.length / total) * 100 }
    ];
  });

  recentActivities = signal<RecentActivity[]>([
    {
      id: '1',
      type: 'university',
      title: 'Nueva universidad registrada',
      description: 'Universidad Nacional de Trujillo',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      icon: 'university'
    },
    {
      id: '2',
      type: 'document',
      title: 'Documento actualizado',
      description: 'Estatuto de la Red 2024',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      icon: 'document'
    },
    {
      id: '3',
      type: 'application',
      title: 'Solicitud recibida',
      description: 'Universidad de Piura solicita adscripción',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      icon: 'mail'
    },
    {
      id: '4',
      type: 'event',
      title: 'Asamblea programada',
      description: 'III Asamblea de Rectores 2026',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      icon: 'calendar'
    }
  ]);

  upcomingEvents = computed(() => this.governanceService.upcomingEvents().slice(0, 3));

  knowledgeStats = computed(() => ({
    researchers: this.knowledgeService.researchers().length,
    experts: this.knowledgeService.experts().length,
    programs: this.knowledgeService.programs().length,
    brigades: this.knowledgeService.brigades().length
  }));

  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `hace ${minutes} min`;
    if (hours < 24) return `hace ${hours}h`;
    return `hace ${days}d`;
  }

  formatEventDay(date: Date): string {
    return new Date(date).getDate().toString();
  }

  formatEventMonth(date: Date): string {
    return new Date(date).toLocaleString('es', { month: 'short' });
  }

  getEventTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'asamblea': 'Asamblea',
      'foro': 'Foro',
      'congreso': 'Congreso',
      'reunion': 'Reunión',
      'capacitacion': 'Capacitación',
      'otro': 'Otro'
    };
    return labels[type] || type;
  }
}
