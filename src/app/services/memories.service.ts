import { Injectable, signal, computed } from '@angular/core';
import {
  ManagementMemory,
  Congress,
  CongressHistory,
  PhotoAlbum,
  Achievement,
  Activity,
  AlbumPhoto
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class MemoriesService {

  private _memories = signal<ManagementMemory[]>([]);
  private _congresses = signal<CongressHistory[]>([]);
  private _albums = signal<PhotoAlbum[]>([]);

  // Computed signals
  readonly memories = computed(() => this._memories());
  readonly congresses = computed(() => this._congresses());
  readonly albums = computed(() => this._albums());

  readonly publishedMemories = computed(() =>
    this._memories().filter(m => m.status === 'publicada' && m.isPublic)
  );

  readonly memoriesByPeriod = computed(() => {
    const memories = this._memories();
    const grouped: { [key: string]: ManagementMemory } = {};
    memories.forEach(m => {
      if (m.period) {
        grouped[m.period] = m;
      }
    });
    return grouped;
  });

  readonly publicCongresses = computed(() =>
    this._congresses().filter(c => c.isPublic)
  );

  readonly publicAlbums = computed(() =>
    this._albums().filter(a => a.isPublic)
  );

  readonly featuredAlbums = computed(() =>
    this._albums().filter(a => a.isPublic && a.isFeatured)
  );

  readonly albumsByEventType = computed(() => {
    const albums = this._albums();
    const grouped: { [key: string]: PhotoAlbum[] } = {};
    albums.forEach(a => {
      if (!grouped[a.eventType]) {
        grouped[a.eventType] = [];
      }
      grouped[a.eventType].push(a);
    });
    return grouped;
  });

  // CRUD Memorias
  addMemory(memory: ManagementMemory): void {
    this._memories.update(memories => [...memories, memory]);
  }

  updateMemory(id: string, updates: Partial<ManagementMemory>): void {
    this._memories.update(memories =>
      memories.map(m => m.id === id ? { ...m, ...updates, updatedAt: new Date() } : m)
    );
  }

  deleteMemory(id: string): void {
    this._memories.update(memories => memories.filter(m => m.id !== id));
  }

  getMemoryById(id: string): ManagementMemory | undefined {
    return this._memories().find(m => m.id === id);
  }

  getMemoryByPeriod(period: string): ManagementMemory | undefined {
    return this._memories().find(m => m.period === period);
  }

  publishMemory(id: string): void {
    this._memories.update(memories =>
      memories.map(m => m.id === id
        ? { ...m, status: 'publicada' as const, publishedAt: new Date(), updatedAt: new Date() }
        : m
      )
    );
  }

  // Gestión de Logros
  addAchievement(memoryId: string, achievement: Achievement): void {
    this._memories.update(memories =>
      memories.map(m => {
        if (m.id === memoryId) {
          return { ...m, achievements: [...(m.achievements || []), achievement], updatedAt: new Date() };
        }
        return m;
      })
    );
  }

  updateAchievement(memoryId: string, achievementId: string, updates: Partial<Achievement>): void {
    this._memories.update(memories =>
      memories.map(m => {
        if (m.id === memoryId) {
          return {
            ...m,
            achievements: (m.achievements || []).map((a: Achievement) =>
              a.id === achievementId ? { ...a, ...updates } : a
            ),
            updatedAt: new Date()
          };
        }
        return m;
      })
    );
  }

  removeAchievement(memoryId: string, achievementId: string): void {
    this._memories.update(memories =>
      memories.map(m => {
        if (m.id === memoryId) {
          return {
            ...m,
            achievements: (m.achievements || []).filter((a: Achievement) => a.id !== achievementId),
            updatedAt: new Date()
          };
        }
        return m;
      })
    );
  }

  // Gestión de Actividades
  addActivity(memoryId: string, activity: Activity): void {
    this._memories.update(memories =>
      memories.map(m => {
        if (m.id === memoryId) {
          return { ...m, activities: [...(m.activities || []), activity], updatedAt: new Date() };
        }
        return m;
      })
    );
  }

  updateActivity(memoryId: string, activityId: string, updates: Partial<Activity>): void {
    this._memories.update(memories =>
      memories.map(m => {
        if (m.id === memoryId) {
          return {
            ...m,
            activities: (m.activities || []).map((a: Activity) =>
              a.id === activityId ? { ...a, ...updates } : a
            ),
            updatedAt: new Date()
          };
        }
        return m;
      })
    );
  }

  removeActivity(memoryId: string, activityId: string): void {
    this._memories.update(memories =>
      memories.map(m => {
        if (m.id === memoryId) {
          return {
            ...m,
            activities: (m.activities || []).filter((a: Activity) => a.id !== activityId),
            updatedAt: new Date()
          };
        }
        return m;
      })
    );
  }

  // CRUD Congresos
  addCongress(congress: CongressHistory): void {
    this._congresses.update(congresses => [...congresses, congress]);
  }

  updateCongress(id: string, updates: Partial<CongressHistory>): void {
    this._congresses.update(congresses =>
      congresses.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c)
    );
  }

  deleteCongress(id: string): void {
    this._congresses.update(congresses => congresses.filter(c => c.id !== id));
  }

  getCongressById(id: string): CongressHistory | undefined {
    return this._congresses().find(c => c.id === id);
  }

  getCongressByEdition(edition: number): CongressHistory | undefined {
    return this._congresses().find(c => c.edition === edition);
  }

  // CRUD Álbumes
  addAlbum(album: PhotoAlbum): void {
    this._albums.update(albums => [...albums, album]);
  }

  updateAlbum(id: string, updates: Partial<PhotoAlbum>): void {
    this._albums.update(albums =>
      albums.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a)
    );
  }

  deleteAlbum(id: string): void {
    this._albums.update(albums => albums.filter(a => a.id !== id));
  }

  getAlbumById(id: string): PhotoAlbum | undefined {
    return this._albums().find(a => a.id === id);
  }

  // Gestión de Fotos en Álbumes
  addPhotoToAlbum(albumId: string, photo: AlbumPhoto): void {
    this._albums.update(albums =>
      albums.map(a => {
        if (a.id === albumId) {
          const newPhotos = [...a.photos, photo];
          return {
            ...a,
            photos: newPhotos,
            coverPhotoUrl: photo.isCover ? photo.url : a.coverPhotoUrl,
            updatedAt: new Date()
          };
        }
        return a;
      })
    );
  }

  updatePhotoInAlbum(albumId: string, photoId: string, updates: Partial<AlbumPhoto>): void {
    this._albums.update(albums =>
      albums.map(a => {
        if (a.id === albumId) {
          const updatedPhotos = a.photos.map(p =>
            p.id === photoId ? { ...p, ...updates } : p
          );
          // Si la foto actualizada es la portada, actualizar coverPhotoUrl
          const coverPhoto = updatedPhotos.find(p => p.isCover);
          return {
            ...a,
            photos: updatedPhotos,
            coverPhotoUrl: coverPhoto?.url || a.coverPhotoUrl,
            updatedAt: new Date()
          };
        }
        return a;
      })
    );
  }

  removePhotoFromAlbum(albumId: string, photoId: string): void {
    this._albums.update(albums =>
      albums.map(a => {
        if (a.id === albumId) {
          return {
            ...a,
            photos: a.photos.filter(p => p.id !== photoId),
            updatedAt: new Date()
          };
        }
        return a;
      })
    );
  }

  setCoverPhoto(albumId: string, photoId: string): void {
    this._albums.update(albums =>
      albums.map(a => {
        if (a.id === albumId) {
          const updatedPhotos = a.photos.map(p => ({
            ...p,
            isCover: p.id === photoId
          }));
          const coverPhoto = updatedPhotos.find(p => p.isCover);
          return {
            ...a,
            photos: updatedPhotos,
            coverPhotoUrl: coverPhoto?.url,
            updatedAt: new Date()
          };
        }
        return a;
      })
    );
  }

  // Búsquedas
  searchAlbums(query: string): PhotoAlbum[] {
    const lowerQuery = query.toLowerCase();
    return this._albums().filter(a =>
      a.title.toLowerCase().includes(lowerQuery) ||
      a.description?.toLowerCase().includes(lowerQuery) ||
      a.eventName?.toLowerCase().includes(lowerQuery)
    );
  }
}
