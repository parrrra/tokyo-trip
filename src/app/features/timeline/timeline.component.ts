import { Component, Input } from '@angular/core';
import { Day } from '../../core/models/day.model';
import { Place } from '../../core/models/place.model';
import { DayAccordionComponent } from './day-accordion.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'timeline',
  standalone: true,
  imports: [CommonModule, DayAccordionComponent],
  template: `
    <div class="text-sm text-gray-500 mb-4">
      📅 {{ days().length }} días · 📍 {{ places().length }} sitios
    </div>

    <div class="space-y-4">
      @for (day of days(); track day.date) {
        <div class="bg-white rounded-xl shadow p-4">
          <day-accordion
            [day]="day"
            [places]="getPlacesForDay(day)"
            [toggleVisited]="toggleVisited"
            [deletePlace]="deletePlace"
          />
        </div>
      }
    </div>
  `
})
export class TimelineComponent {
  @Input({ required: true }) days!: () => Day[];
  @Input({ required: true }) places!: () => Place[];
  @Input({ required: true }) toggleVisited!: (id: string) => void;
  @Input({ required: true }) deletePlace!: (id: string) => void;


  getPlacesForDay(day: Day): Place[] {
    return this.places().filter(p => day.placeIds.includes(p.id));
  }
}
