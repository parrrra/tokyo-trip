import { Component, EventEmitter, Output, Input, OnChanges } from '@angular/core';
import { PlaceType } from '../../core/models/place.model';
import { FormsModule } from '@angular/forms';
import { TripService } from '../../core/services/trip.service';

@Component({
  selector: 'add-place-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
        (click)="close()"
      >
        <div
          class="bg-white rounded-xl p-6 w-full max-w-md"
          (click)="$event.stopPropagation()"
        >

          <h2 class="text-xl font-bold mb-4">
            {{ place ? 'Editar sitio' : 'Añadir sitio' }}
          </h2>

          <div class="flex flex-col gap-3">
            <input
              class="border p-2 rounded"
              placeholder="Nombre"
              [(ngModel)]="name"
            />

            <select class="border p-2 rounded" [(ngModel)]="type">
              <option value="comida">Comida</option>
              <option value="visit">Visita</option>
            </select>

            <!-- 👇 SIEMPRE visible -->
            <input
              class="border p-2 rounded"
              type="date"
              [(ngModel)]="day"
              [min]="minDate"
              [max]="maxDate"
            />

            <input
              class="border p-2 rounded"
              placeholder="Google Maps"
              [(ngModel)]="mapsUrl"
            />
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button (click)="close()">Cancelar</button>
            <button
              class="bg-red-500 text-white px-4 py-2 rounded"
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
  @Input() place: { id?: string; name: string; type: PlaceType; mapsUrl?: string; day?: string } | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() save = new EventEmitter<{
    id?: string;
    name: string;
    type: PlaceType;
    mapsUrl: string;
    day: string;
  }>();

  name = '';
  type: PlaceType = 'comida';
  day = '';
  mapsUrl = '';

  minDate: string;
  maxDate: string;

  constructor(private tripService: TripService) {
    this.minDate = this.tripService.getStartDateISO();
    this.maxDate = this.tripService.getEndDateISO();
  }

  ngOnChanges() {
    if (this.place) {
      this.name = this.place.name;
      this.type = this.place.type;
      this.mapsUrl = this.place.mapsUrl ?? '';
      this.day = this.place.day ?? this.minDate;
      return;
    }

    this.reset();
    this.day = this.minDate;
  }

  canSubmit() {
    return this.name.trim().length > 0 && this.day;
  }

  close() {
    this.reset();
    this.closeModal.emit();
  }

  submit() {
    this.save.emit({
      id: this.place?.id,
      name: this.name.trim(),
      type: this.type,
      mapsUrl: this.mapsUrl.trim() || '',
      day: this.day
    });

    this.close();
  }

  reset() {
    this.name = '';
    this.type = 'comida';
    this.day = '';
    this.mapsUrl = '';
  }
}
