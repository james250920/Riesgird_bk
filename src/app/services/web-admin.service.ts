import { Injectable, computed, signal } from '@angular/core';

export interface WebResource {
  id: string;
  title: string;
  type: 'documento' | 'enlace' | 'video' | 'imagen';
  url: string;
  description?: string;
  isPublic: boolean;
  updatedAt: Date;
}

export interface WebMenuItem {
  id: string;
  label: string;
  path: string;
  order: number;
  isVisible: boolean;
}

export interface WebSeoConfig {
  siteTitle: string;
  metaDescription: string;
  keywords: string;
  ogImageUrl: string;
  maintenanceMode: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WebAdminService {
  private _resources = signal<WebResource[]>([
    {
      id: crypto.randomUUID(),
      title: 'Guia de uso del portal',
      type: 'documento',
      url: 'https://example.com/guia.pdf',
      description: 'Manual principal para administradores web.',
      isPublic: true,
      updatedAt: new Date()
    }
  ]);

  private _menuItems = signal<WebMenuItem[]>([
    {
      id: crypto.randomUUID(),
      label: 'Inicio',
      path: '/',
      order: 1,
      isVisible: true
    },
    {
      id: crypto.randomUUID(),
      label: 'Recursos',
      path: '/recursos',
      order: 2,
      isVisible: true
    }
  ]);

  private _seoConfig = signal<WebSeoConfig>({
    siteTitle: 'RIESGIRD-ACC',
    metaDescription: 'Portal institucional de la red RIESGIRD-ACC',
    keywords: 'riesgo, cambio climatico, universidades, peru',
    ogImageUrl: '',
    maintenanceMode: false
  });

  readonly resources = computed(() => this._resources());
  readonly menuItems = computed(() => [...this._menuItems()].sort((a, b) => a.order - b.order));
  readonly seoConfig = computed(() => this._seoConfig());

  addResource(resource: Omit<WebResource, 'id' | 'updatedAt'>): void {
    this._resources.update(resources => [
      {
        ...resource,
        id: crypto.randomUUID(),
        updatedAt: new Date()
      },
      ...resources
    ]);
  }

  updateResource(id: string, updates: Partial<WebResource>): void {
    this._resources.update(resources =>
      resources.map(resource =>
        resource.id === id
          ? { ...resource, ...updates, updatedAt: new Date() }
          : resource
      )
    );
  }

  deleteResource(id: string): void {
    this._resources.update(resources => resources.filter(resource => resource.id !== id));
  }

  addMenuItem(item: Omit<WebMenuItem, 'id'>): void {
    this._menuItems.update(items => [...items, { ...item, id: crypto.randomUUID() }]);
  }

  updateMenuItem(id: string, updates: Partial<WebMenuItem>): void {
    this._menuItems.update(items =>
      items.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  }

  deleteMenuItem(id: string): void {
    this._menuItems.update(items => items.filter(item => item.id !== id));
  }

  updateSeoConfig(updates: Partial<WebSeoConfig>): void {
    this._seoConfig.update(config => ({ ...config, ...updates }));
  }
}
