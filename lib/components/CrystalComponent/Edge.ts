import { Color, Q5 } from 'q5xts';
import { Particle } from './Particle';

export class Edge {
  color: Color;
  bgColor: Color;
  points: Array<Particle>;
  constructor(points: Array<Particle>, color: Color, bgColor: Color) {
    this.points = points;
    this.color = new Color(color._r, color._g, color._b, 0);
    this.bgColor = new Color(bgColor._r, bgColor._g, bgColor._b, 1);
  }

  draw(sketch: Q5) {
    this.color._a += 0.05;
    sketch.push();
    sketch.strokeWeight(5);
    sketch.noStroke();
    sketch.fill(this.color);
    sketch.beginShape();
    this.points.forEach((point) => {
      sketch.vertex(point.pos.x, point.pos.y);
    });
    sketch.endShape(sketch.CLOSE);
    sketch.pop();
    sketch.push();
    sketch.strokeWeight(5);
    sketch.stroke(this.bgColor);
    this.points.forEach((point, i) => {
      const nextPoint = this.points[(i + 1) % this.points.length];
      sketch.line(point.pos.x, point.pos.y, nextPoint.pos.x, nextPoint.pos.y);
    });
    sketch.pop();
  }

  // we only care about the mutuals, we do not care about the
  // range
  pointsConnected() {
    for (const particle of this.points) {
      for (const particle2 of this.points) {
        if (particle.id === particle2.id) continue;
        if (!particle.hasMutual(particle2)) return false;
      }
    }
    return true;
  }
}
