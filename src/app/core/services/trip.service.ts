import { Injectable } from '@angular/core';
import { Trip } from '../models/trip.model';

@Injectable({ providedIn: 'root' })
export class TripService {

  readonly trip: Trip = {
    id: 'tokyo-2026',
    name: 'Tokyo Trip 🇯🇵',
    startDate: new Date('2026-11-01T11:25:00'),
    endDate: new Date('2026-11-17T23:59:59')
  };

  getStartDateISO(): string {
    return this.toISODate(this.trip.startDate);
  }

  getEndDateISO(): string {
    return this.toISODate(this.trip.endDate);
  }

  private toISODate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
