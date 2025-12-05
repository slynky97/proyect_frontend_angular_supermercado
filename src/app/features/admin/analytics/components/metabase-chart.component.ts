import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-metabase-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
      @if (title) {
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-gray-900">{{ title }}</h3>
          <div class="flex items-center gap-2">
            <button class="text-gray-400 hover:text-primary-600 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      }
      <div class="flex-1 relative min-h-[300px] overflow-hidden rounded-lg">
        <iframe
          [src]="safeUrl"
          frameborder="0"
          class="w-full absolute top-0 left-0"
          style="height: calc(100% + 80px);"
          allowtransparency
        ></iframe>
      </div>
    </div>
  `,
  styles: [`
    iframe {
      min-height: 300px;
    }
  `]
})
export class MetabaseChartComponent {
  @Input() title: string = '';
  @Input() metabaseUrl: string = '';

  safeUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl('');
  }

  ngOnChanges() {
    if (this.metabaseUrl) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.metabaseUrl);
    }
  }
}
