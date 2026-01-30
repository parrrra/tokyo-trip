import { Injectable, signal } from '@angular/core';
import { Place } from '../models/place.model';
import { db } from '../../../main';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc
} from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class PlacesService {

  private collectionRef = collection(db, 'places');

  places = signal<Place[]>([]);

  async loadPlaces() {
    const snapshot = await getDocs(this.collectionRef);

    const data = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data()['createdAt']?.toDate?.() ?? new Date()
    })) as Place[];

    this.places.set(data);
  }

  async addPlace(place: Omit<Place, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(this.collectionRef, {
      ...place,
      createdAt: new Date()
    });

    this.places.update(prev => [
      ...prev,
      { ...place, id: docRef.id, createdAt: new Date() }
    ]);

    return docRef.id;
  }

  async toggleVisited(placeId: string) {
    const place = this.places().find(p => p.id === placeId);
    if (!place) return;

    await updateDoc(doc(this.collectionRef, placeId), {
      visited: !place.visited
    });

    this.places.update(prev =>
      prev.map(p =>
        p.id === placeId ? { ...p, visited: !p.visited } : p
      )
    );
  }

  async deletePlace(placeId: string) {
    await deleteDoc(doc(this.collectionRef, placeId));

    this.places.update(prev =>
      prev.filter(p => p.id !== placeId)
    );
  }

async updatePlace(place: {
  id: string;
  name: string;
  type: 'comida' | 'lugar';
  mapsUrl: string;
}) {
  await updateDoc(doc(this.collectionRef, place.id), {
    name: place.name,
    type: place.type,
    mapsUrl: place.mapsUrl
  });

  this.places.update(prev =>
    prev.map(p =>
      p.id === place.id ? { ...p, ...place } : p
    )
  );
}


}
