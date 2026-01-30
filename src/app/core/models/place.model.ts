export type PlaceType = 'comida' | 'lugar';

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  mapsUrl?: string;
  visited: boolean;
  createdAt: Date;
}
