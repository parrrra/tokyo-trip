import { Injectable } from '@angular/core';
import { db } from '../../main';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class TripService {

  private placesCollection = collection(db, 'places');

  async addPlace(place: {
    name: string;
    category: string;
    sources?: any[];
    notes?: string;
  }) {
    await addDoc(this.placesCollection, {
      ...place,
      createdAt: new Date()
    });
  }

  async getPlaces() {
    const snapshot = await getDocs(this.placesCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
}
