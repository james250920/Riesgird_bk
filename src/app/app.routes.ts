import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Redirect root to login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Login page (public)
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },

  // Admin panel (protected layout)
  {
    path: 'admin',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      // Dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      // Módulo 1: Identidad y Normativa
      {
        path: 'identidad',
        children: [
          { path: '', redirectTo: 'contenido', pathMatch: 'full' },
          {
            path: 'contenido',
            loadComponent: () => import('./pages/identidad/institutional-content/institutional-content.component').then(m => m.InstitutionalContentComponent)
          },
          {
            path: 'normativa',
            loadComponent: () => import('./pages/identidad/normative-library/normative-library.component').then(m => m.NormativeLibraryComponent)
          },
          {
            path: 'aliados',
            loadComponent: () => import('./pages/identidad/allies-directory/allies-directory.component').then(m => m.AlliesDirectoryComponent)
          }
        ]
      },

      // Módulo 2: Gestión de Universidades Miembros
      {
        path: 'universidades',
        children: [
          { path: '', redirectTo: 'lista', pathMatch: 'full' },
          {
            path: 'lista',
            loadComponent: () => import('./pages/universidades/universities-list/universities-list.component').then(m => m.UniversitiesListComponent)
          },
          {
            path: 'autoridades',
            loadComponent: () => import('./pages/universidades/authorities/authorities.component').then(m => m.AuthoritiesComponent)
          },
          {
            path: 'equipos',
            loadComponent: () => import('./pages/universidades/technical-teams/technical-teams.component').then(m => m.TechnicalTeamsComponent)
          },
          {
            path: 'repositorio',
            loadComponent: () => import('./pages/universidades/reports-repository/reports-repository.component').then(m => m.ReportsRepositoryComponent)
          }
        ]
      },

      // Módulo 3: Workflow de Membresía y Adscripción
      {
        path: 'membresia',
        children: [
          { path: '', redirectTo: 'requisitos', pathMatch: 'full' },
          {
            path: 'requisitos',
            loadComponent: () => import('./pages/membresia/requirements/requirements.component').then(m => m.RequirementsComponent)
          },
          {
            path: 'plantillas',
            loadComponent: () => import('./pages/membresia/templates/templates.component').then(m => m.TemplatesComponent)
          },
          {
            path: 'solicitudes',
            loadComponent: () => import('./pages/membresia/applications/applications.component').then(m => m.ApplicationsComponent)
          },
          {
            path: 'certificados',
            loadComponent: () => import('./pages/membresia/certificates/certificates.component').then(m => m.CertificatesComponent)
          }
        ]
      },

      // Módulo 4: Gobernanza y Eventos
      {
        path: 'gobernanza',
        children: [
          { path: '', redirectTo: 'asambleas', pathMatch: 'full' },
          {
            path: 'asambleas',
            loadComponent: () => import('./pages/gobernanza/assemblies/assemblies.component').then(m => m.AssembliesComponent)
          },
          {
            path: 'eventos',
            loadComponent: () => import('./pages/gobernanza/forum-events/forum-events.component').then(m => m.ForumEventsComponent)
          },
          {
            path: 'calendario',
            loadComponent: () => import('./pages/gobernanza/calendar/calendar.component').then(m => m.CalendarComponent)
          }
        ]
      },

      // Módulo 5: Gestión del Conocimiento y Talento
      {
        path: 'conocimiento',
        children: [
          { path: '', redirectTo: 'investigadores', pathMatch: 'full' },
          {
            path: 'investigadores',
            loadComponent: () => import('./pages/conocimiento/researchers/researchers.component').then(m => m.ResearchersComponent)
          },
          {
            path: 'expertos',
            loadComponent: () => import('./pages/conocimiento/experts/experts.component').then(m => m.ExpertsComponent)
          },
          {
            path: 'programas',
            loadComponent: () => import('./pages/conocimiento/programs/programs.component').then(m => m.ProgramsComponent)
          },
          {
            path: 'brigadas',
            loadComponent: () => import('./pages/conocimiento/brigades/brigades.component').then(m => m.BrigadesComponent)
          }
        ]
      },

      // Módulo 6: Memorias e Informes Históricos
      {
        path: 'memorias',
        children: [
          { path: '', redirectTo: 'gestion', pathMatch: 'full' },
          {
            path: 'gestion',
            loadComponent: () => import('./pages/memorias/management-memories/management-memories.component').then(m => m.ManagementMemoriesComponent)
          },
          {
            path: 'congresos',
            loadComponent: () => import('./pages/memorias/congresses/congresses.component').then(m => m.CongressesComponent)
          },
          {
            path: 'multimedia',
            loadComponent: () => import('./pages/memorias/multimedia/multimedia.component').then(m => m.MultimediaComponent)
          }
        ]
      },

      // Módulo 7: Configuración del Sistema
      {
        path: 'configuracion',
        children: [
          { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
          {
            path: 'usuarios',
            loadComponent: () => import('./pages/configuracion/users/users.component').then(m => m.UsersComponent)
          },
          {
            path: 'permisos',
            loadComponent: () => import('./pages/configuracion/permissions/permissions.component').then(m => m.PermissionsComponent)
          },
          {
            path: 'auditoria',
            loadComponent: () => import('./pages/configuracion/audit/audit.component').then(m => m.AuditComponent)
          }
        ]
      },

      // Módulo 8: Gestión Web
      {
        path: 'web',
        children: [
          { path: '', redirectTo: 'recursos', pathMatch: 'full' },
          {
            path: 'recursos',
            loadComponent: () => import('./pages/web/resources/resources.component').then(m => m.ResourcesComponent)
          },
          {
            path: 'menus',
            loadComponent: () => import('./pages/web/menus/menus.component').then(m => m.MenusComponent)
          },
          {
            path: 'seo',
            loadComponent: () => import('./pages/web/site-settings/site-settings.component').then(m => m.SiteSettingsComponent)
          }
        ]
      }
    ]
  },

  // Wildcard - redirect to login
  { path: '**', redirectTo: 'login' }
];
