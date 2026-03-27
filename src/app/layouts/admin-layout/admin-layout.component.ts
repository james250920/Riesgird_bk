import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services';
import { IconComponent } from '../../shared/icons/icons.component';

interface NavItem {
  label: string;
  icon: string;  // Now uses icon names like 'home', 'users', 'settings'
  route: string;
  children?: NavItem[];
  permission?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, IconComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  router = inject(Router);

  sidebarCollapsed = signal(false);
  mobileMenuOpen = signal(false);
  pageTitle = signal('Dashboard');
  breadcrumbs = signal<string[]>([]);
  showPublicContent = signal(false);

  // Notificaciones
  showNotificationsPanel = signal(false);
  notifications = signal<Notification[]>([
    {
      id: '1',
      title: 'Nueva solicitud de membresía',
      message: 'Universidad Nacional de Piura ha enviado una solicitud',
      type: 'info',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 30) // hace 30 minutos
    },
    {
      id: '2',
      title: 'Asamblea programada',
      message: 'Recordatorio: Asamblea General mañana a las 10:00 AM',
      type: 'warning',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // hace 2 horas
    },
    {
      id: '3',
      title: 'Documento aprobado',
      message: 'El informe anual 2025 ha sido aprobado',
      type: 'success',
      read: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // hace 1 día
    }
  ]);

  unreadCount = () => this.notifications().filter(n => !n.read).length;

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'home', route: '/admin/dashboard' },
    {
      label: 'Identidad y Normativa',
      icon: 'building',
      route: '/admin/identidad',
      children: [
        { label: 'Contenido Institucional', icon: 'document', route: '/admin/identidad/contenido' },
        { label: 'Biblioteca Normativa', icon: 'book', route: '/admin/identidad/normativa' },
        { label: 'Directorio de Aliados', icon: 'team', route: '/admin/identidad/aliados' }
      ]
    },
    {
      label: 'Universidades',
      icon: 'university',
      route: '/admin/universidades',
      children: [
        { label: 'Directorio', icon: 'folder', route: '/admin/universidades/lista' },
        { label: 'Autoridades', icon: 'users', route: '/admin/universidades/autoridades' },
        { label: 'Equipos Técnicos', icon: 'team', route: '/admin/universidades/equipos' },
        { label: 'Repositorio', icon: 'folder', route: '/admin/universidades/repositorio' }
      ]
    },
    {
      label: 'Membresía',
      icon: 'membership',
      route: '/admin/membresia',
      children: [
        { label: 'Requisitos', icon: 'requirement', route: '/admin/membresia/requisitos' },
        { label: 'Plantillas', icon: 'template', route: '/admin/membresia/plantillas' },
        { label: 'Solicitudes', icon: 'application', route: '/admin/membresia/solicitudes' },
        { label: 'Certificados', icon: 'award', route: '/admin/membresia/certificados' }
      ]
    },
    {
      label: 'Gobernanza',
      icon: 'governance',
      route: '/admin/gobernanza',
      children: [
        { label: 'Asambleas', icon: 'assembly', route: '/admin/gobernanza/asambleas' },
        { label: 'Eventos', icon: 'forum', route: '/admin/gobernanza/eventos' },
        { label: 'Calendario', icon: 'calendar', route: '/admin/gobernanza/calendario' }
      ]
    },
    {
      label: 'Conocimiento',
      icon: 'research',
      route: '/admin/conocimiento',
      children: [
        { label: 'Investigadores', icon: 'expert', route: '/admin/conocimiento/investigadores' },
        { label: 'Red de Expertos', icon: 'globe', route: '/admin/conocimiento/expertos' },
        { label: 'Programas', icon: 'program', route: '/admin/conocimiento/programas' },
        { label: 'Brigadas', icon: 'brigade', route: '/admin/conocimiento/brigadas' }
      ]
    },
    {
      label: 'Memorias',
      icon: 'memory',
      route: '/admin/memorias',
      children: [
        { label: 'Gestión', icon: 'report', route: '/admin/memorias/gestion' },
        { label: 'Congresos', icon: 'congress', route: '/admin/memorias/congresos' },
        { label: 'Multimedia', icon: 'multimedia', route: '/admin/memorias/multimedia' }
      ]
    },
    {
      label: 'Configuración',
      icon: 'settings',
      route: '/admin/configuracion',
      children: [
        { label: 'Usuarios', icon: 'users', route: '/admin/configuracion/usuarios' },
        { label: 'Permisos', icon: 'shield', route: '/admin/configuracion/permisos' },
        { label: 'Auditoría', icon: 'document', route: '/admin/configuracion/auditoria' }
      ]
    }
  ];

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  togglePublicContent(): void {
    this.showPublicContent.update(v => !v);
  }

  // Notificaciones
  toggleNotifications(): void {
    this.showNotificationsPanel.update(v => !v);
  }

  closeNotifications(): void {
    this.showNotificationsPanel.set(false);
  }

  markAsRead(notification: Notification): void {
    this.notifications.update(notifs =>
      notifs.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
  }

  markAllAsRead(): void {
    this.notifications.update(notifs =>
      notifs.map(n => ({ ...n, read: true }))
    );
  }

  deleteNotification(notification: Notification): void {
    this.notifications.update(notifs =>
      notifs.filter(n => n.id !== notification.id)
    );
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  }

  // Configuración
  goToSettings(): void {
    this.router.navigate(['/admin/configuracion/usuarios']);
  }

  getUserInitials(): string {
    const name = this.authService.currentUser()?.fullName || '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getRoleLabel(): string {
    const roleLabels: Record<string, string> = {
      'super_admin': 'Super Administrador',
      'admin_red': 'Administrador de Red',
      'admin_universidad': 'Admin. Universidad',
      'editor': 'Editor',
      'viewer': 'Visualizador'
    };
    return roleLabels[this.authService.currentUser()?.role || ''] || 'Usuario';
  }

  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
    this.router.navigate(['/login']);
  }
}
