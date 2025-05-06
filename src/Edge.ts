import { Color } from 'q5xts';
import { Particle } from './Particle';

export class Edge {
  color: Color;
  points: Array<Particle>;
  constructor(points: Array<Particle>, color: Color) {
    this.points = points;
    this.color = color;
  }
}
