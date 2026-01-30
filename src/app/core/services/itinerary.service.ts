import { Injectable, signal } from '@angular/core';
import { Day } from '../models/day.model';
import { db } from '../../../main';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class ItineraryService {

  private collectionRef = collection(db, 'days');

  days = signal<Day[]>([]);

  async loadDays() {
    const snapshot = await getDocs(this.collectionRef);

    this.days.set(
      snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Day, 'id'>)
      }))
    );
  }

  async addPlaceToDay(dayDate: string, placeId: string) {
    let day = this.days().find(d => d.date === dayDate);

    // 🧠 SI NO EXISTE EL DÍA → SE CREA
    if (!day) {
      const docRef = await addDoc(this.collectionRef, {
        date: dayDate,
        placeIds: [placeId]
      });

      const newDay: Day = {
        id: docRef.id,
        date: dayDate,
        placeIds: [placeId]
      };

      this.days.update(prev => [...prev, newDay]);
      return;
    }

    // evitar duplicados
    if (day.placeIds.includes(placeId)) return;

    const updatedPlaceIds = [...day.placeIds, placeId];

    await updateDoc(
      doc(this.collectionRef, day.id),
      { placeIds: updatedPlaceIds }
    );

    this.days.update(prev =>
      prev.map(d =>
        d.id === day.id
          ? { ...d, placeIds: updatedPlaceIds }
          : d
      )
    );
  }

 async removePlaceFromAllDays(placeId: string) {
  const affectedDays = this.days().filter(d =>
    d.placeIds.includes(placeId)
  );

  for (const day of affectedDays) {
    const updatedPlaceIds = day.placeIds.filter(id => id !== placeId);

    // 🧹 SI EL DÍA SE QUEDA VACÍO → SE BORRA
    if (updatedPlaceIds.length === 0) {
      await deleteDoc(doc(this.collectionRef, day.id));

      this.days.update(prev =>
        prev.filter(d => d.id !== day.id)
      );

      continue;
    }

    // si no, se actualiza normal
    await updateDoc(
      doc(this.collectionRef, day.id),
      { placeIds: updatedPlaceIds }
    );

    this.days.update(prev =>
      prev.map(d =>
        d.id === day.id
          ? { ...d, placeIds: updatedPlaceIds }
          : d
      )
    );
  }
}


}
