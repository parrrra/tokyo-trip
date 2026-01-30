import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TripService } from './services/trip.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App implements OnInit {

  // ✅ SIGNAL
  items = signal<any[]>([]);

  constructor(private tripService: TripService) {}

  async ngOnInit() {
    await this.loadItems();
  }

  async addItem() {
    await this.tripService.addPlace({
      name: 'Ichiran Ramen',
      category: 'food'
    });

    await this.loadItems();
  }

  async loadItems() {
    const data = await this.tripService.getPlaces();
    this.items.set(data); // 🔥 CLAVE
    console.log(data);
  }
}
