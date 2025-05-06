import { Color, Vector } from 'q5xts';
import { Drawing } from './Drawing';
import { Edge } from './Edge';
import { Particle } from './Particle';

interface Edges {
  [id: string]: Edge;
}

interface Particles {
  [id: string]: Particle;
}

export class Crystal {
  padding: number;
  sketch: Drawing;
  pos: Vector;
  particles: Particles;
  edges: Edges;
  distance: number;
  color: Color;

  constructor(sketch: Drawing, pos: Vector, color: Color) {
    this.padding = 5;
    this.sketch = sketch;
    this.color = color;
    this.pos = pos;
    this.distance = this.sketch.config.distance.value;
    this.particles = this.createParticles();
    this.edges = {};
  }

  drawLinks() {
    Object.keys(this.particles).forEach((key) => {
      const point = this.particles[key];
      point.links.forEach((linked) => {
        this.sketch.push();
        this.sketch.stroke(this.sketch.getBackground());
        this.sketch.strokeWeight(10);
        this.sketch.line(point.pos.x, point.pos.y, linked.pos.x, linked.pos.y);
        this.sketch.ctx?.setLineDash([10, 10]);
        this.sketch.stroke(this.color);
        this.sketch.strokeWeight(3);
        this.sketch.line(point.pos.x, point.pos.y, linked.pos.x, linked.pos.y);
        this.sketch.pop();
      });
    });
  }

  drawBoundingBox() {
    this.sketch.push();
    this.sketch.stroke(this.color);
    this.sketch.strokeWeight(1);
    this.sketch.noFill();
    this.sketch.rect(this.pos.x, this.pos.y, this.distance * 2, this.distance * 2);
    this.sketch.pop();
  }

  inXBounds(point: Particle) {
    return (
      point.pos.x > this.pos.x - this.distance + this.padding &&
      point.pos.x < this.pos.x + this.distance - this.padding
    );
  }

  inYBounds(point: Particle) {
    return (
      point.pos.y > this.pos.y - this.distance + this.padding &&
      point.pos.y < this.pos.y + this.distance - this.padding
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

  linkRadius() {
    return this.sketch.config.linkRadius.value;
  }

  createParticles() {
    const newPoints: Particles = {};
    for (let i = 0; i < this.sketch.config.particleNumber.value; i++) {
      const particle = this.createParticle();
      newPoints[particle.id] = particle;
    }
    return newPoints;
  }

  createParticle(): Particle {
    const xPos = this.sketch.random(
      this.pos.x + this.distance - this.sketch.padding,
      this.pos.x - this.distance + this.sketch.padding
    );
    const yPos = this.sketch.random(
      this.pos.y + this.distance - this.sketch.padding,
      this.pos.y - this.distance + this.sketch.padding
    );
    const dirs = [1, -1];
    const xDir = this.sketch.random(dirs.length, 0);
    const yDir = this.sketch.random(dirs.length, 0);
    const position = this.sketch.createVector(xPos, yPos);
    const direction = this.sketch.createVector(dirs[xDir], dirs[yDir]);
    const velocity = this.sketch.createVector(
      this.sketch.config.particleSpeed.value,
      this.sketch.config.particleSpeed.value
    );
    const particle = new Particle(position, direction, velocity);
    return particle;
  }

  addParticle() {
    const particle = this.createParticle();
    this.particles[particle.id] = particle;
  }

  removeParticle() {
    const [randomPoint] = Object.keys(this.particles);
    const point = this.particles[randomPoint];
    point.links.forEach((linked) => {
      linked.removeLink(point);
    });
    // point.edges.forEach((edgeId) => {
    //   delete this.edges[edgeId];
    // });
    delete this.particles[randomPoint];
  }

  drawParticles() {
    this.sketch.push();
    Object.keys(this.particles).forEach((key) => {
      const point = this.particles[key];
      this.sketch.stroke(this.sketch.getBackground());
      this.sketch.strokeWeight(10);
      this.sketch.point(point.pos);
      this.sketch.stroke(this.color);
      this.sketch.strokeWeight(5);
      this.sketch.point(point.pos);
    });
    this.sketch.pop();
  }

  updateSpeed() {
    Object.keys(this.particles).forEach((key) => {
      const point = this.particles[key];
      const newVelocity = this.sketch.createVector(
        this.sketch.config.particleSpeed.value * this.sketch.getSign(point.velocity.x),
        this.sketch.config.particleSpeed.value * this.sketch.getSign(point.velocity.y)
      );
      point.velocity = newVelocity;
    });
  }

  // TODO: Use quad tree for faster search
  buildLinks() {
    for (const key in this.particles) {
      const particle = this.particles[key];
      for (const key2 in this.particles) {
        const particle2 = this.particles[key2];
        if (particle.id === particle2.id) continue;
        if (particle.inRange(particle2.pos, this.linkRadius() / 2)) {
          particle.link(particle2);
          particle2.link(particle);
        } else if (particle.links.has(particle2)) {
          particle.removeLink(particle2);
          particle2.removeLink(particle);
        }
      }
    }
  }

  // critical function to ensure we get a polygon
  sortPoints(points: Array<Particle>) {
    const averageX = points.reduce((sum, point) => sum + point.pos.x, 0) / points.length;
    const averageY = points.reduce((sum, point) => sum + point.pos.y, 0) / points.length;
    const centroid = this.sketch.createVector(averageX, averageY);

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
        this.edges[id] = new Edge(edgePoints, this.color);
      }
    }
  }

  drawEdges() {
    if (Object.keys(this.edges).length === 0) return;
    // draw it in slowly?
    for (const key in this.edges) {
      this.sketch.push();
      const edge = this.edges[key];
      this.sketch.strokeWeight(5);
      this.sketch.noStroke();
      this.sketch.fill(this.color);
      this.sketch.beginShape();
      edge.points.forEach((point) => {
        this.sketch.vertex(point.pos.x, point.pos.y);
      });
      this.sketch.endShape(this.sketch.CLOSE);
      this.sketch.pop();
      this.sketch.push();
      this.sketch.strokeWeight(5);
      this.sketch.stroke(this.sketch.getBackground());
      edge.points.forEach((point, i) => {
        const nextPoint = edge.points[(i + 1) % edge.points.length];
        this.sketch.line(point.pos.x, point.pos.y, nextPoint.pos.x, nextPoint.pos.y);
      });
      this.sketch.pop();
    }
    // maybe don't do this over and over again?
    this.edges = {};
  }

  menuFunctions() {
    if (this.sketch.config.displayEdges.value) {
      this.drawEdges();
    }
    if (this.sketch.config.displayLinks.value) {
      this.drawLinks();
    }
    if (this.sketch.config.displayPoints.value) {
      this.drawParticles();
    }
    if (this.sketch.config.displayBorder.value) {
      this.drawBoundingBox();
    }
  }

  mouseInput() {
    for (const key in this.particles) {
      const particle = this.particles[key];
      const mouseVector = this.sketch.createVector(
        this.sketch.mouseX,
        this.sketch.mouseY
      );
      if (particle.inRange(mouseVector, 10)) {
        this.sketch.push();
        this.sketch.stroke(this.color);
        this.sketch.strokeWeight(1);
        this.sketch.noFill();
        this.sketch.circle(particle.pos.x, particle.pos.y, this.linkRadius());
        this.sketch.pop();
      }
    }
  }

  draw() {
    this.buildLinks();
    this.buildEdges();
    this.menuFunctions();
    this.mouseInput();
    if (this.sketch.config.pause.value) return;
    this.movePoints();
  }
  // TODO: how can i implement this in future?
  grow() {}
}
