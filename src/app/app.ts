import { Component, OnInit, signal } from '@angular/core';
import { TimelineComponent } from './features/timeline/timeline.component';
import { PlacesService } from './core/services/places.service';
import { ItineraryService } from './core/services/itinerary.service';
import { AddPlaceModalComponent } from './features/add-place/add-place-modal.component';
import { Place } from './core/models/place.model';
import { Day } from './core/models/day.model';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TripService } from './core/services/trip.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    TimelineComponent,
    AddPlaceModalComponent
  ],
  templateUrl: './app.html',
})
export class App implements OnInit {

  countdown = signal('');

  private flightDate = new Date('2026-11-01T11:25:00');

  places!: () => Place[];
  days!: () => Day[];

  showAddModal = signal(false);
  editingPlace = signal<Place & { day: string } | null>(null);

  constructor(
    private placesService: PlacesService,
    private itineraryService: ItineraryService,
    private tripService: TripService
  ) {
    this.places = this.placesService.places;
    this.days = this.itineraryService.days;
  }

  async ngOnInit() {
    await this.placesService.loadPlaces();
    await this.itineraryService.loadDays();

    this.updateCountdown();
    setInterval(() => this.updateCountdown(), 1000);
  }

  private updateCountdown() {
    const diff = this.flightDate.getTime() - Date.now();

    if (diff <= 0) {
      this.countdown.set('¡Ya estamos volando!');
      return;
    }

    const s = Math.floor(diff / 1000) % 60;
    const m = Math.floor(diff / (1000 * 60)) % 60;
    const h = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));

    this.countdown.set(`${d}d ${h}h ${m}m ${s}s`);
  }

  toggleVisited = (placeId: string) => {
    this.placesService.toggleVisited(placeId);
  };

  deletePlace = async (placeId: string) => {
    const place = this.places().find(p => p.id === placeId);
    if (!place || place.visited) return;

    if (!confirm('¿Eliminar este sitio?')) return;

    await this.itineraryService.removePlaceFromAllDays(placeId);
    await this.placesService.deletePlace(placeId);
  };

  openAddModal = () => {
    this.editingPlace.set(null);
    this.showAddModal.set(true);
  };

openEditModal = (place: Place) => {
  const day = this.itineraryService.getDayForPlace(place.id);

  this.editingPlace.set({
    ...place,
    day: day ?? this.tripService.getStartDateISO()
  });

  this.showAddModal.set(true);
};


  closeAddModal = () => {
    this.showAddModal.set(false);
    this.editingPlace.set(null);
  };

 onSavePlace = async (data: {
  id?: string;
  name: string;
  type: 'comida' | 'lugar';
  mapsUrl: string;
  day: string;
}) => {

  // ✏️ EDITAR
  if (data.id) {
    // 1. actualizar datos del place
    await this.placesService.updatePlace({
      id: data.id,
      name: data.name,
      type: data.type,
      mapsUrl: data.mapsUrl
    });

    // 2. mover de día si es necesario
    await this.itineraryService.movePlaceToDay(data.id, data.day);
    return;
  }

  // ➕ CREAR
  const placeId = await this.placesService.addPlace({
    name: data.name,
    type: data.type,
    mapsUrl: data.mapsUrl,
    visited: false
  });

  await this.itineraryService.addPlaceToDay(data.day, placeId);
};


  get visitedCount(): number {
  return this.places().filter(p => p.visited).length;
}

}
