import { Vector } from 'q5xts';
import { nanoid } from 'nanoid';

export class Particle {
  id: string;
  edges: Set<string>;
  links: Set<Particle>;
  speed: number;
  direction: Vector;
  velocity: Vector;
  pos: Vector;

  constructor(pos: Vector, direction: Vector, velocity: Vector) {
    this.id = nanoid();
    this.edges = new Set();
    this.links = new Set();
    this.speed = 5;
    this.pos = pos;
    this.direction = direction;
    this.velocity = velocity;
    this.velocity.mult(direction);
  }

  move() {
    this.pos.add(this.velocity);
  }

  getMutuals(point: Particle): Array<Particle> {
    const mutuals: Array<Particle> = [];
    // console.log({
    //   point,
    //   links: this.links,
    // });
    for (const linked of this.links) {
      if (linked.links.has(point)) {
        mutuals.push(linked);
      }
    }
    return mutuals;
  }

  hasMutual(point: Particle): Particle | void {
    for (const linked of this.links) {
      if (linked.links.has(point)) {
        return linked;
      }
    }
    return;
  }

  link(point: Particle) {
    this.links.add(point);
  }

  removeLink(point: Particle) {
    this.links.delete(point);
  }

  inRange(target: Vector, threshold: number) {
    return this.pos.dist(target) < threshold;
  }
}
