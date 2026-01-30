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

  const days = snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<Day, 'id'>)
  })) as Day[];

  // 🔥 ORDENAR POR FECHA (YYYY-MM-DD se ordena perfecto como string)
  days.sort((a, b) => a.date.localeCompare(b.date));

  this.days.set(days);
}


async addPlaceToDay(dayDate: string, placeId: string) {

  const existingDay = this.days().find(d => d.date === dayDate);

  // 🧠 NO EXISTE → CREAR
  if (!existingDay) {
    const docRef = await addDoc(this.collectionRef, {
      date: dayDate,
      placeIds: [placeId]
    });

    const newDay: Day = {
      id: docRef.id,
      date: dayDate,
      placeIds: [placeId]
    };

    this.days.update(prev =>
      this.sortDays([...prev, newDay])
    );

    return;
  }

  // 🧠 EXISTE → ACTUALIZAR
  if (existingDay.placeIds.includes(placeId)) return;

  const updatedPlaceIds = [...existingDay.placeIds, placeId];

  await updateDoc(
    doc(this.collectionRef, existingDay.id),
    { placeIds: updatedPlaceIds }
  );

  this.days.update(prev =>
    this.sortDays(
      prev.map(d =>
        d.id === existingDay.id
          ? { ...d, placeIds: updatedPlaceIds }
          : d
      )
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

async movePlaceToDay(placeId: string, targetDayDate: string) {

  const currentDay = this.days().find(d =>
    d.placeIds.includes(placeId)
  );

  // si ya está en ese día → nada que hacer
  if (currentDay?.date === targetDayDate) {
    return;
  }

  // 1️⃣ quitar del día actual
  if (currentDay) {
    const updatedIds = currentDay.placeIds.filter(id => id !== placeId);

    if (updatedIds.length === 0) {
      // borrar día vacío
      await deleteDoc(doc(this.collectionRef, currentDay.id));
      this.days.update(prev =>
        prev.filter(d => d.id !== currentDay.id)
      );
    } else {
      await updateDoc(
        doc(this.collectionRef, currentDay.id),
        { placeIds: updatedIds }
      );

      this.days.update(prev =>
        prev.map(d =>
          d.id === currentDay.id
            ? { ...d, placeIds: updatedIds }
            : d
        )
      );
    }
  }

  // 2️⃣ añadir al nuevo día
  await this.addPlaceToDay(targetDayDate, placeId);
}

getDayForPlace(placeId: string): string | null {
  const day = this.days().find(d => d.placeIds.includes(placeId));
  return day ? day.date : null;
}
private sortDays(days: Day[]): Day[] {
  return [...days].sort((a, b) => a.date.localeCompare(b.date));
}


}
