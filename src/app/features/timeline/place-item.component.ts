import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Place } from '../../core/models/place.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'place-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex items-center justify-between py-2 px-3 rounded-lg
             hover:bg-gray-50 transition"
    >
      <div class="flex items-center gap-3 cursor-pointer"
           (click)="toggle.emit(place.id)">
        
        <!-- checkbox custom -->
        <div
          class="w-5 h-5 rounded border flex items-center justify-center
                 transition"
          [class.bg-green-500]="place.visited"
          [class.border-green-500]="place.visited"
          [class.border-gray-300]="!place.visited"
        >
          @if (place.visited) {
            <i class="fa-solid fa-check text-white text-xs"></i>
          }
        </div>

        <span
          class="text-xs px-2 py-0.5 rounded bg-gray-100 uppercase tracking-wide"
        >
          {{ place.type }}
        </span>

        <span
          class="text-sm"
          [class.line-through]="place.visited"
          [class.text-gray-400]="place.visited"
        >
          {{ place.name }}
        </span>
      </div>

      <div class="flex items-center gap-3">
        @if (place.mapsUrl) {
          <a
            [href]="place.mapsUrl"
            target="_blank"
            class="text-gray-400 hover:text-blue-500 cursor-pointer"
          >
            <i class="fa-solid fa-location-dot"></i>
          </a>
        }

        @if (!place.visited) {
          <button
            class="text-gray-400 hover:text-red-500 cursor-pointer"
            (click)="delete.emit(place.id)"
          >
            <i class="fa-solid fa-trash"></i>
          </button>
        }
      </div>
    </div>
  `
})
export class PlaceItemComponent {
  @Input({ required: true }) place!: Place;
  @Output() toggle = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
}
