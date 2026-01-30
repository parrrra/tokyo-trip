import { Component, Input } from '@angular/core';
import { Day } from '../../core/models/day.model';
import { Place } from '../../core/models/place.model';
import { PlaceItemComponent } from './place-item.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'day-accordion',
  standalone: true,
  imports: [CommonModule, PlaceItemComponent],
  template: `
<div>
  <div
    class="flex justify-between items-center cursor-pointer select-none"
    (click)="open = !open"
  >
    <h3 class="font-semibold text-base">
      {{ formatDate(day.date) }}
    </h3>

    <i
      class="fa-solid fa-chevron-down text-gray-400 transition"
      [class.rotate-180]="open"
    ></i>
  </div>

  @if (open) {
    <div class="mt-4 space-y-2">
      @for (place of places; track place.id) {
        <place-item
          [place]="place"
          (toggle)="onToggle($event)"
          (delete)="onDelete($event)"
        />
      }
    </div>
  }
</div>

  `
})
export class DayAccordionComponent {
  @Input({ required: true }) day!: Day;
  @Input({ required: true }) places!: Place[];
  @Input({ required: true }) toggleVisited!: (id: string) => void;
  @Input({ required: true }) deletePlace!: (id: string) => void;

  open = true;

  onToggle(placeId: string) {
    this.toggleVisited(placeId);
  }

  formatDate(date: string): string {
    // YYYY-MM-DD -> DD/MM/YYYY
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  onDelete(placeId: string) {
  this.deletePlace(placeId);
}
}
