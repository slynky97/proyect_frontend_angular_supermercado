import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8 h-full flex flex-col">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Análisis de Datos</h1>
        <p class="text-gray-600 mt-2">Visualización de métricas y reportes interactivos</p>
      </div>

      <div class="flex-1 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 relative">
        @if (metabaseUrl) {
          <iframe
            [src]="safeUrl"
            frameborder="0"
            width="100%"
            style="height: calc(100% + 60px);"
            allowtransparency
            class="absolute top-0 left-0 w-full"
          ></iframe>
        } @else {
          <div class="flex flex-col items-center justify-center h-full text-center p-8">
            <div class="bg-blue-50 p-4 rounded-full mb-4">
              <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Integración con Metabase</h3>
            <p class="text-gray-500 max-w-md mb-6">
              Para visualizar los reportes, necesitas configurar la URL de tu dashboard de Metabase.
            </p>
            <div class="bg-gray-50 p-4 rounded-lg text-left w-full max-w-lg border border-gray-200">
              <p class="text-sm font-medium text-gray-700 mb-2">Pasos para integrar:</p>
              <ol class="list-decimal list-inside text-sm text-gray-600 space-y-1">
                <li>Instala y configura Metabase en tu servidor.</li>
                <li>Crea un dashboard público o genera una URL firmada.</li>
                <li>Actualiza la variable <code>metabaseUrl</code> en este componente.</li>
              </ol>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class AnalyticsComponent {
  private sanitizer = inject(DomSanitizer);

  // Metabase Dashboard URL
  metabaseUrl: string = 'http://localhost:3001/public/dashboard/7bd68711-2d9c-4a53-bf39-2068d1032914';

  get safeUrl(): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.metabaseUrl);
  }
}
