import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-image-preview-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div 
      class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      (click)="close()"
    >
      <div 
        class="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
        (click)="$event.stopPropagation()"
      >
        <!-- Close Button -->
        <button 
          (click)="close()"
          class="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 shadow-lg transition-all hover:scale-110"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <!-- Image -->
        <div class="flex items-center justify-center bg-gray-100 min-h-[400px]">
          <img 
            [src]="imageUrl" 
            [alt]="imageAlt"
            class="max-w-full max-h-[80vh] object-contain"
            (error)="handleImageError($event)"
          />
        </div>

        <!-- Image Info -->
        @if (imageAlt) {
          <div class="bg-white p-4 border-t border-gray-200">
            <h3 class="font-semibold text-gray-900 text-lg">{{ imageAlt }}</h3>
            @if (imageDescription) {
              <p class="text-sm text-gray-600 mt-1">{{ imageDescription }}</p>
            }
          </div>
        }
      </div>
    </div>
  `,
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class ImagePreviewModalComponent {
    @Input() imageUrl: string = '';
    @Input() imageAlt: string = '';
    @Input() imageDescription?: string;
    @Output() closed = new EventEmitter<void>();

    close() {
        this.closed.emit();
    }

    handleImageError(event: any) {
        event.target.src = 'https://via.placeholder.com/400x400?text=Imagen+No+Disponible';
    }
}
