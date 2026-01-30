import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Place } from '../../core/models/place.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'place-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex items-center justify-between gap-2 py-1"
      [class.opacity-50]="place.visited"
    >
      <div class="flex items-center gap-2">
        <input
          type="checkbox"
          [checked]="place.visited"
          (change)="toggle.emit(place.id)"
        />

        <span class="text-xs px-2 py-0.5 rounded bg-gray-100">
          {{ place.type }}
        </span>

        <span [class.line-through]="place.visited">
          {{ place.name }}
        </span>
      </div>

      <div class="flex items-center gap-2">
        @if (place.mapsUrl) {
          <a
            [href]="place.mapsUrl"
            target="_blank"
            class="text-blue-500 text-sm"
          >
            🗺️
          </a>
        }

  @if (!place.visited) {
          <button
            class="text-red-500 hover:text-red-700"
            title="Eliminar"
            (click)="delete.emit(place.id)"
          >
            🗑️
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
