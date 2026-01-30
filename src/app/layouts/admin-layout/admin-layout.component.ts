import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services';
import { IconComponent } from '../../shared/icons/icons.component';

interface NavItem {
  label: string;
  icon: string;  // Now uses icon names like 'home', 'users', 'settings'
  route: string;
  children?: NavItem[];
  permission?: string;
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

  sidebarCollapsed = signal(false);
  mobileMenuOpen = signal(false);
  pageTitle = signal('Dashboard');
  breadcrumbs = signal<string[]>([]);
  showPublicContent = signal(false);

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
        { label: 'Directorio', icon: 'folder', route: '/admin/universidades/directorio' },
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
        { label: 'Foro Interuniversitario', icon: 'forum', route: '/admin/gobernanza/foro' },
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
  }
}
