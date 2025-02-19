import { Color, Vector } from 'q5xts';
import { Drawing } from './Drawing';

class Particle {
  links: Set<Particle>;
  speed: number;
  direction: Vector;
  velocity: Vector;
  pos: Vector;

  constructor(pos: Vector, direction: Vector, velocity: Vector) {
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

  dispose() {
    this.links.forEach((linked) => {
      linked.removeLink(this);
    });
  }
}

export class Crystal {
  sketch: Drawing;
  pos: Vector;
  points: Array<Particle>;
  numPoints: number;
  distance: number;
  linkThreshold: number;
  padding: number;

  constructor(sketch: Drawing, pos: Vector) {
    this.sketch = sketch;
    this.pos = pos;
    this.numPoints = 50;
    this.padding = 5;
    this.distance = this.sketch.config.distance;
    this.linkThreshold = 4;
    this.points = [];
    this.createParticles();
    this.buildLinks();
  }

  // TODO: Use quad tree for faster search
  buildLinks() {
    this.points.forEach((point, i) => {
      this.points.forEach((point2, j) => {
        if (i === j) return;
        if (point.pos.dist(point2.pos) < this.sketch.config.linkRadius / 2) {
          point.link(point2);
        } else if (point.links.has(point2)) {
          point.removeLink(point2);
        }
      });
    });
  }

  filterPointThreshold() {
    // we need to filter this twice? Each time you filter you have to remove the link
    // from the other points
    //TODO: we should not have to run this multiple times. Find better way
    this.points = this.points.filter((point) => {
      if (point.links.size < this.linkThreshold) {
        point.dispose();
        return false;
      }
      return true;
    });
    // this.checkMutual();
    // we should also check for mutual points too? if we have no points in common remove me
  }

  // TODO: Decent idea, but this turns it all into triangles when we still want quads?
  // TODO: could be good for a future project but not now. Try for testing
  checkMutual() {
    this.points.forEach((point) => {
      point.links.forEach((linked) => {
        if (!point.hasMutual(linked)) {
          point.removeLink(linked);
          linked.removeLink(point);
        }
      });
    });
    // see if 2 points have the same point in common. If not remove the link;
  }

  createParticles() {
    for (let i = 0; i < this.sketch.config.particleNumber; i++) {
      const particle = this.createParticle();
      this.points.push(particle);
    }
  }

  createParticle(): Particle {
    const xPos = this.sketch.random(
      this.pos.x + this.distance - this.padding,
      this.pos.x - this.distance + this.padding
    );
    const yPos = this.sketch.random(
      this.pos.y + this.distance - this.padding,
      this.pos.y - this.distance + this.padding
    );
    const dirs = [1, -1];
    const xDir = this.sketch.random(dirs.length, 0);
    const yDir = this.sketch.random(dirs.length, 0);
    const position = this.sketch.createVector(xPos, yPos);
    const direction = this.sketch.createVector(dirs[xDir], dirs[yDir]);
    const velocity = this.sketch.createVector(
      this.sketch.config.particleSpeed,
      this.sketch.config.particleSpeed
    );
    const particle = new Particle(position, direction, velocity);
    return particle;
  }

  movePoints() {
    this.points.forEach((point) => {
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

  updateSpeed() {
    this.points.forEach((point) => {
      const newVelocity = this.sketch.createVector(
        this.sketch.config.particleSpeed * this.sketch.getSign(point.velocity.x),
        this.sketch.config.particleSpeed * this.sketch.getSign(point.velocity.y)
      );
      point.velocity = newVelocity;
    });
  }

  draw() {
    this.drawShape();
    this.drawLines();
    if (this.sketch.config.displayPoints) {
      this.drawPoints();
    }
    if (this.sketch.config.displayBorder) {
      this.drawBoundingBox();
    }
    if (this.sketch.config.pause) return;
    this.movePoints();
    this.buildLinks();
  }

  drawBoundingBox() {
    this.sketch.push();
    const { red, green, blue } = this.sketch.config;
    const color = new Color(red, green, blue, 1);
    this.sketch.stroke(color);
    this.sketch.strokeWeight(1);
    this.sketch.noFill();
    this.sketch.rect(this.pos.x, this.pos.y, this.distance * 2, this.distance * 2);
    this.sketch.pop();
  }

  drawPoints() {
    this.sketch.push();
    const { red, green, blue } = this.sketch.config;
    const color = new Color(red, green, blue, 1);
    this.sketch.stroke(color);
    this.sketch.noFill();
    this.points.forEach((point) => {
      // this.sketch.circle(point.pos.x, point.pos.y, this.sketch.config.linkRadius);
      this.sketch.point(point.pos);
    });
    this.sketch.pop();
  }

  drawLines() {
    this.sketch.stroke(this.sketch.config.backgroundColor);
    this.sketch.strokeWeight(7);
    this.points.forEach((point) => {
      point.links.forEach((linked) => {
        this.sketch.line(point.pos.x, point.pos.y, linked.pos.x, linked.pos.y);
        // const mutual = point.hasMutual(linked);
        // if (!mutual) return;
        // const aSide = point.pos.dist(mutual.pos);
        // const bSide = mutual.pos.dist(linked.pos);
        // const cSide = linked.pos.dist(point.pos);
        // const semiParameter = (aSide + bSide + cSide) / 2;

        // const area = Math.sqrt(
        //   semiParameter *
        //     (semiParameter - aSide) *
        //     (semiParameter - bSide) *
        //     (semiParameter - cSide)
        // );
        // if (area < 2000) return;
        // console.log('draw line');
        // this.sketch.line(point.pos.x, point.pos.y, mutual.pos.x, mutual.pos.y);
        // this.sketch.line(mutual.pos.x, mutual.pos.y, linked.pos.x, linked.pos.y);
        // this.sketch.line(linked.pos.x, linked.pos.y, point.pos.x, point.pos.y);
      });
    });
  }

  drawShape() {
    this.sketch.push();
    this.sketch.stroke(this.sketch.config.backgroundColor);
    this.sketch.strokeWeight(this.padding);

    this.points.forEach((point) => {
      const { red, green, blue } = this.sketch.config;
      const color = new Color(red, green, blue, 1);
      this.sketch.fill(color);

      point.links.forEach((linked) => {
        const mutual = point.hasMutual(linked);
        if (!mutual) return;
        // if area reaches threshold, allow shape to be created
        this.sketch.noStroke();
        this.sketch.beginShape();
        this.sketch.vertex(point.pos.x, point.pos.y);
        this.sketch.vertex(mutual.pos.x, mutual.pos.y);
        this.sketch.vertex(linked.pos.x, linked.pos.y);
        this.sketch.endShape(this.sketch.CLOSE);
        this.sketch.stroke(this.sketch.config.backgroundColor);
        // this.sketch.line(point.pos.x, point.pos.y, mutual.pos.x, mutual.pos.y);
        // this.sketch.line(mutual.pos.x, mutual.pos.y, linked.pos.x, linked.pos.y);
        // this.sketch.line(linked.pos.x, linked.pos.y, point.pos.x, point.pos.y);
      });
    });
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

  addParticle() {
    const particle = this.createParticle();
    this.points.push(particle);
  }

  removeParticle() {
    const particle = this.points.pop();
    particle?.dispose();
  }

  // TODO: how can i implement this in future?
  grow() {}
}
