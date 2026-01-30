import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InstitutionalService } from '../../../services';
import { InstitutionalContent } from '../../../models';

@Component({
  selector: 'app-institutional-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './institutional-content.component.html',
  styleUrl: './institutional-content.component.scss'
})
export class InstitutionalContentComponent {
  institutionalService = inject(InstitutionalService);

  selectedTab = signal<InstitutionalContent['type']>('mision');
  editableContent = signal('');
  showPreview = signal(false);

  currentContent = () => {
    return this.institutionalService.getContentByType(this.selectedTab());
  };

  constructor() {
    this.loadContent();
  }

  selectTab(type: InstitutionalContent['type']): void {
    this.selectedTab.set(type);
    this.loadContent();
  }

  loadContent(): void {
    const content = this.currentContent();
    if (content) {
      this.editableContent.set(content.content);
    }
  }

  onContentChange(event: Event): void {
    const target = event.target as HTMLElement;
    this.editableContent.set(target.innerHTML);
  }

  formatText(command: string, value?: string): void {
    document.execCommand(command, false, value);
  }

  toggleVisibility(): void {
    const content = this.currentContent();
    if (content) {
      this.institutionalService.updateContent(content.id, {
        isPublic: !content.isPublic
      });
    }
  }

  saveContent(): void {
    const content = this.currentContent();
    if (content) {
      this.institutionalService.updateContent(content.id, {
        content: this.editableContent(),
        updatedBy: 'admin' // En producción, obtener del AuthService
      });
    }
  }

  previewContent(): void {
    this.showPreview.set(true);
  }

  getTextLength(): number {
    const temp = document.createElement('div');
    temp.innerHTML = this.editableContent();
    return temp.textContent?.length || 0;
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
