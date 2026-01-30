export type PlaceType = 'food' | 'visit';

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  mapsUrl?: string;
  visited: boolean;
  createdAt: Date;
}
