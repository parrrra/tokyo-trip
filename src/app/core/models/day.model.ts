export interface Day {
  id: string;        // Firestore document id
  date: string;      // YYYY-MM-DD
  placeIds: string[];
}
