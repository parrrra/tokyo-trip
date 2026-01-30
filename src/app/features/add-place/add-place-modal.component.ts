import { Component, EventEmitter, Output, Input, OnChanges } from '@angular/core';
import { PlaceType } from '../../core/models/place.model';
import { FormsModule } from '@angular/forms';
import { TripService } from '../../core/services/trip.service';

@Component({
  selector: 'add-place-modal',
  imports: [FormsModule],
  standalone: true,
  template: `
    @if (open()) {
      <div class="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
        <div class="bg-white rounded-xl p-6 w-full max-w-md">

          <h2 class="text-xl font-bold mb-4">Añadir sitio</h2>

          <div class="flex flex-col gap-3">
            <input
              class="border p-2 rounded"
              placeholder="Nombre del sitio"
              [(ngModel)]="name"
            />

            <select class="border p-2 rounded" [(ngModel)]="type">
              <option value="food">Comida</option>
              <option value="visit">Visita</option>
            </select>

            <input
              class="border p-2 rounded"
              type="date"
              [(ngModel)]="day"
              [min]="minDate"
              [max]="maxDate"
            />

            <input
              class="border p-2 rounded"
              placeholder="Google Maps (opcional)"
              [(ngModel)]="mapsUrl"
            />
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <button class="px-4 py-2" (click)="close()">
              Cancelar
            </button>

            <button
              class="px-4 py-2 bg-blue-500 text-white rounded"
              (click)="submit()"
              [disabled]="!canSubmit()"
            >
              Guardar
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class AddPlaceModalComponent implements OnChanges {

  @Input({ required: true }) open!: () => boolean;
  @Output() closeModal = new EventEmitter<void>();
  @Output() save = new EventEmitter<{
    name: string;
    type: PlaceType;
    day: string;
    mapsUrl: string;
  }>();

  name = '';
  type: PlaceType = 'food';
  day = '';
  mapsUrl = '';

  minDate: string;
  maxDate: string;

  constructor(private tripService: TripService) {
    this.minDate = this.tripService.getStartDateISO();
    this.maxDate = this.tripService.getEndDateISO();
  }

  ngOnChanges() {
    // al abrir el modal → fecha por defecto = inicio del viaje
    if (this.open() && !this.day) {
      this.day = this.minDate;
    }
  }

  canSubmit() {
    return this.name.trim() && this.day;
  }

  close() {
    this.closeModal.emit();
  }

  submit() {
    this.save.emit({
      name: this.name.trim(),
      type: this.type,
      day: this.day,
      mapsUrl: this.mapsUrl.trim() || ''
    });

    this.close();
    this.reset();
  }

  reset() {
    this.name = '';
    this.type = 'food';
    this.day = '';
    this.mapsUrl = '';
  }
}
