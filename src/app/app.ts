import { Component, OnInit, signal } from '@angular/core';
import { TimelineComponent } from './features/timeline/timeline.component';
import { PlacesService } from './core/services/places.service';
import { ItineraryService } from './core/services/itinerary.service';
import { AddPlaceModalComponent } from './features/add-place/add-place-modal.component';
import { Place } from './core/models/place.model';
import { Day } from './core/models/day.model';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

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

  // 🕒 Vuelo Madrid → Tokio
  private flightDate = new Date('2026-11-01T11:25:00');

  places!: () => Place[];
  days!: () => Day[];

  showAddModal = signal(false);

  constructor(
    private placesService: PlacesService,
    private itineraryService: ItineraryService
  ) {
    this.places = this.placesService.places;
    this.days = this.itineraryService.days;
  }

  async ngOnInit() {
    await this.placesService.loadPlaces();
    await this.itineraryService.loadDays();

    // ⏱️ ARRANCAR COUNTDOWN
    this.updateCountdown();
    setInterval(() => this.updateCountdown(), 1000);
  }

  private updateCountdown() {
    const now = new Date();
    const diff = this.flightDate.getTime() - now.getTime();

    if (diff <= 0) {
      this.countdown.set('¡Ya estamos volando! ✈️');
      return;
    }

    const seconds = Math.floor(diff / 1000) % 60;
    const minutes = Math.floor(diff / (1000 * 60)) % 60;
    const hours   = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));

    this.countdown.set(`${days}d ${hours}h ${minutes}m ${seconds}s`);
  }

  toggleVisited = (placeId: string) => {
    this.placesService.toggleVisited(placeId);
  };

deletePlace = async (placeId: string) => {
  const place = this.places().find(p => p.id === placeId);
  if (!place) return;

  // 🛑 seguridad extra
  if (place.visited) {
    alert('No puedes eliminar un sitio ya visitado 😉');
    return;
  }

  if (!confirm('¿Eliminar este sitio del viaje?')) return;

  await this.itineraryService.removePlaceFromAllDays(placeId);
  await this.placesService.deletePlace(placeId);
};

  openAddModal = () => this.showAddModal.set(true);
  closeAddModal = () => this.showAddModal.set(false);

  onAddPlace = async (data: {
    name: string;
    type: 'food' | 'visit';
    day: string;
    mapsUrl?: string;
  }) => {
    const placeId = await this.placesService.addPlace({
      name: data.name,
      type: data.type,
      mapsUrl: data.mapsUrl || '',
      visited: false
    });

    await this.itineraryService.addPlaceToDay(data.day, placeId);
  };
}
