import { Color, Q5, Vector } from 'q5xts';
import { Edge } from './Edge.js';
import { Particle } from './Particle';

interface CrystalOptions {
  particleNumber: number;
  color: {
    red: number;
    green: number;
    blue: number;
  };
  backgroundColor: {
    red: number;
    green: number;
    blue: number;
  };
}

interface Edges {
  [id: string]: Edge;
}

interface Particles {
  [id: string]: Particle;
}

// GREAT COLORS DO NOT DELETE
// const color1 = new Color(210, 119, 95, 1);
// const color2 = new Color(210, 200, 95, 1);
// const color3 = new Color(100, 119, 200, 1);
export class Crystal extends Q5 {
  // menu?: Menu;
  colors: {
    main: Color;
    background: Color;
  };
  pos: Vector;
  particles: Particles;
  edges: Edges;
  speed: number;
  linkRadius: number;

  constructor(parent: HTMLElement, options: CrystalOptions) {
    super('', parent);
    this.colors = {
      main: new Color(options.color.red, options.color.green, options.color.blue, 1),
      background: new Color(
        options.backgroundColor.red,
        options.backgroundColor.green,
        options.backgroundColor.blue,
        1
      ),
    };

    this.linkRadius = 200;
    this.speed = 0.025;
    this.pos = this.createVector(this.width / 2, this.height / 2);
    this.particles = this.createParticles(options.particleNumber);
    this.edges = {};
    this.setup = () => {
      this.pixelDensity(window.devicePixelRatio);
      this.strokeWeight(5);
      this.frameRate(60);
      // @ts-expect-error fix this in the next q5xts version
      this.rectMode(this.CENTER);
      this.drawCrystal();
    };
    this.draw = () => {
      const bg = new Color(0, 0, 0, 0);
      this.background(bg);
      this.drawCrystal();
    };
  }

  createParticles(particleCount: number) {
    const newPoints: Particles = {};
    for (let i = 0; i < particleCount; i++) {
      const particle = this.createParticle();
      newPoints[particle.id] = particle;
    }
    return newPoints;
  }

  createParticle(): Particle {
    const xPos = this.random(
      this.pos.x + this.width / 2 - 2,
      this.pos.x - this.width / 2 + 2
    );
    const yPos = this.random(
      this.pos.y + this.height / 2 - 2,
      this.pos.y - this.height / 2 + 2
    );
    const dirs = [1, -1];
    const xDir = this.random(dirs.length, 0);
    const yDir = this.random(dirs.length, 0);
    const position = this.createVector(xPos, yPos);
    const direction = this.createVector(dirs[xDir], dirs[yDir]);
    const velocity = this.createVector(this.speed, this.speed);
    const particle = new Particle(position, direction, velocity);
    return particle;
  }

  buildLinks() {
    for (const key in this.particles) {
      const particle = this.particles[key];
      for (const key2 in this.particles) {
        const particle2 = this.particles[key2];
        if (particle.id === particle2.id) continue;
        if (particle.inRange(particle2.pos, this.linkRadius / 2)) {
          particle.link(particle2);
          particle2.link(particle);
        } else if (particle.links.has(particle2)) {
          particle.removeLink(particle2);
          particle2.removeLink(particle);
        }
      }
    }
  }

  cleanupEdges() {
    for (const id in this.edges) {
      const edge = this.edges[id];
      if (!edge.pointsConnected()) {
        delete this.edges[id];
      }
    }
  }

  sortPoints(points: Array<Particle>) {
    const averageX = points.reduce((sum, point) => sum + point.pos.x, 0) / points.length;
    const averageY = points.reduce((sum, point) => sum + point.pos.y, 0) / points.length;
    const centroid = this.createVector(averageX, averageY);

    return points.sort((a, b) => {
      const angleA = Math.atan2(a.pos.y - centroid.y, a.pos.x - centroid.x);
      const angleB = Math.atan2(b.pos.y - centroid.y, b.pos.x - centroid.x);
      return angleA - angleB;
    });
  }

  buildEdges() {
    for (const key in this.particles) {
      const particle = this.particles[key];
      if (particle.links.size < 3) continue;
      for (const linked of particle.links) {
        const mutuals = particle.getMutuals(linked);
        if (mutuals.length < 2) continue;
        const foundPoints = [particle, ...mutuals, linked];
        const id = foundPoints
          .map((point) => point.id)
          .sort()
          .join('|');
        if (this.edges[id]) continue;
        const edgePoints = this.sortPoints(foundPoints);
        this.edges[id] = new Edge(edgePoints, this.colors.main, this.colors.background);
      }
    }
  }

  drawEdges() {
    if (Object.keys(this.edges).length === 0) return;
    for (const key in this.edges) {
      this.push();
      const edge = this.edges[key];
      edge.draw(this);
      this.pop();
    }
  }

  inXBounds(point: Particle) {
    return (
      point.pos.x > this.pos.x - this.width / 2 + 2 &&
      point.pos.x < this.pos.x + this.width / 2 - 2
    );
  }

  inYBounds(point: Particle) {
    return (
      point.pos.y > this.pos.y - this.height / 2 + 2 &&
      point.pos.y < this.pos.y + this.height / 2 - 2
    );
  }

  movePoints() {
    Object.keys(this.particles).forEach((key) => {
      const point = this.particles[key];
      point.move();
      if (!this.inXBounds(point)) {
        point.direction.mult(-1, point.direction.y);
        point.velocity.mult(point.direction);
      }
      if (!this.inYBounds(point)) {
        point.direction.mult(point.direction.x, -1);
        point.velocity.mult(point.direction);
      }
    });
  }

  drawCrystal() {
    this.cleanupEdges();
    this.buildLinks();
    this.buildEdges();
    this.drawEdges();
    this.movePoints();
  }

  random(max: number, min: number): number {
    return Math.floor(this.lerp(max, min, Math.random()));
  }

  randomVector(xMax: number, xMin: number, yMax: number, yMin: number): Vector {
    return this.createVector(this.random(xMax, xMin), this.random(yMax, yMin));
  }

  getSign(number: number): number {
    return number < 0 ? -1 : 1;
  }
}
