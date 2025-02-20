import { Color, Vector } from 'q5xts';
import { Drawing } from './Drawing';
import { nanoid } from 'nanoid';

// might be better to attach edge ids to this to remove

const colors = ['red', 'green', 'blue'];
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

    this.links.forEach((linked) => {
      if (linked.links.has(point)) {
        mutuals.push(linked);
      }
    });
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
}

class Edge {
  id: string;
  color: Color;
  points: Array<Particle>;
  constructor(id: string, points: Array<Particle>, color: Color) {
    this.id = id;
    this.points = points;
    this.color = color;
    this.points.forEach((point) => {
      point.edges.add(this.id);
    });
  }
}

interface Edges {
  [id: string]: Edge;
}

interface Points {
  [id: string]: Particle;
}

export class Crystal {
  sketch: Drawing;
  pos: Vector;
  points: Points;
  edges: Edges;
  numPoints: number;
  distance: number;
  linkThreshold: number;
  padding: number;
  add: boolean;
  colorIndex: number;
  colorChangeNum: number;

  constructor(sketch: Drawing, pos: Vector) {
    this.sketch = sketch;
    this.pos = pos;
    this.numPoints = 50;
    this.colorIndex = 0;
    this.colorChangeNum = 0;
    this.padding = 5;
    this.add = true;
    this.distance = Number(this.sketch.config.distance.value);
    this.linkThreshold = 2;
    this.points = {};
    this.edges = {};
    this.createParticles();
    this.buildLinks();
  }

  filterPointThreshold() {
    //TODO: we should not have to run this multiple times. Find better way
    Object.keys(this.points).forEach((key) => {
      const point = this.points[key];
      if (point.links.size < this.linkThreshold && point.edges.size > 0) {
        // there are cases when edges are not getting deleted
        // when distance is too far
        point.edges.forEach((edgeId) => {
          delete this.edges[edgeId];
        });
        point.edges = new Set();
      }
    });
  }
  buildEdges() {
    this.sketch.push();
    Object.keys(this.points).forEach((key) => {
      const point = this.points[key];
      point.links.forEach((linked) => {
        const mutuals = point.getMutuals(linked);
        if (mutuals.length <= 3) return;
        const edgePoints = [point, ...mutuals, linked];
        const id = edgePoints
          .map((p) => p.id)
          .sort()
          .join('-');
        if (this.edges[id]) return;
        // i think we have to build it correctly though, otherwise we'll get weird shapes?
        // lets just build it and get the weird shapes for now
        const color = this.sketch.getStroke();
        const edge = new Edge(id, edgePoints, color);
        // here we can see how many mutual links there are?
        // depending on how many mutual links there are we can build the shape
        // if (!mutual) return;
        // const id = [point.id, mutual.id, linked.id].sort().join('-');
        // color._a = Math.random();
        // make sure all the points are linked!
        this.edges[id] = edge;
      });
    });
    this.sketch.pop();
  }
  // TODO: Use quad tree for faster search
  buildLinks() {
    Object.keys(this.points).forEach((key, i) => {
      const point = this.points[key];
      Object.keys(this.points).forEach((key2, j) => {
        const point2 = this.points[key2];
        if (i === j) return;
        if (
          point.pos.dist(point2.pos) <
          Number(this.sketch.config.linkRadius.value) / 2
        ) {
          point.link(point2);
        } else if (point.links.has(point2)) {
          //   const mutual = point.hasMutual(point2);
          //   if (mutual) {
          //     const id = [point.id, mutual.id, point2.id].sort().join('-');
          //     delete this.edges[id];
          //   }
          point.removeLink(point2);
          //   point2.removeLink(point);
        }
      });
    });
  }

  // TODO: Decent idea, but this turns it all into triangles when we still want quads?
  // TODO: could be good for a future project but not now. Try for testing
  checkMutual() {
    Object.keys(this.points).forEach((key) => {
      const point = this.points[key];
      point.links.forEach((linked) => {
        if (!point.hasMutual(linked)) {
          point.removeLink(linked);
          linked.removeLink(point);
        }
      });
    });
  }

  draw() {
    this.buildLinks();
    this.filterPointThreshold();
    // this.drawLines();
    this.buildEdges();

    if (this.sketch.config.displayEdges.value) {
      this.drawEdges();
    }
    if (this.sketch.config.displayLinks.value) {
      this.drawLinks();
    }
    if (this.sketch.config.displayPoints.value) {
      this.drawPoints();
    }
    if (this.sketch.config.displayRadius.value) {
      this.drawRadius();
    }
    if (this.sketch.config.displayBorder.value) {
      this.drawBoundingBox();
    }
    if (this.sketch.config.pause.value) return;

    // this.updateColor();
    this.movePoints();
  }

  drawEdges() {
    Object.keys(this.edges).forEach((key) => {
      const edge = this.edges[key];
      this.sketch.noStroke();
      this.sketch.beginShape();
      this.sketch.fill(edge.color);
      edge.points.forEach((point) => {
        this.sketch.vertex(point.pos.x, point.pos.y);
      });
      this.sketch.endShape(this.sketch.CLOSE);

      this.sketch.stroke(this.sketch.getBackground());
      edge.points.forEach((point, i) => {
        const nextPoint = edge.points[(i + 1) % edge.points.length];
        this.sketch.line(point.pos.x, point.pos.y, nextPoint.pos.x, nextPoint.pos.y);
      });
    });
  }

  drawLines() {
    this.sketch.stroke(this.sketch.getBackground());
    Object.keys(this.edges).forEach((key) => {
      const edge = this.edges[key];
      edge.points.forEach((point, i) => {
        const nextPoint = edge.points[(i + 1) % edge.points.length];
        this.sketch.line(point.pos.x, point.pos.y, nextPoint.pos.x, nextPoint.pos.y);
      });
    });
  }

  updateColor() {
    const color = colors[this.colorIndex];
    if (this.add) {
      this.sketch.config[color].value += 1;
    } else {
      this.sketch.config[color].value -= 1;
    }
    if (
      Number(this.sketch.config[color].value) >= 255 ||
      Number(this.sketch.config[color].value) <= 0
    ) {
      this.colorChangeNum += 1;
      if (this.colorChangeNum >= colors.length) {
        this.add = !this.add;
        this.colorChangeNum = 0;
        this.colorIndex = Math.floor(Math.random() * colors.length);
      }
    }
  }

  // TODO: how can i implement this in future?
  grow() {}

  //   SOLVED FUNCTIONS
  //   SOLVED FUNCTIONS
  //   SOLVED FUNCTIONS
  drawLinks() {
    this.sketch.push();
    Object.keys(this.points).forEach((key) => {
      const point = this.points[key];
      point.links.forEach((linked) => {
        this.sketch.stroke(this.sketch.getBackground());
        this.sketch.strokeWeight(10);
        this.sketch.line(point.pos.x, point.pos.y, linked.pos.x, linked.pos.y);

        this.sketch.stroke(this.sketch.getStroke());
        this.sketch.strokeWeight(5);
        this.sketch.line(point.pos.x, point.pos.y, linked.pos.x, linked.pos.y);
      });
    });
    this.sketch.pop();
  }
  drawBoundingBox() {
    this.sketch.push();
    this.sketch.stroke(this.sketch.getStroke());
    this.sketch.strokeWeight(1);
    this.sketch.noFill();
    this.sketch.rect(this.pos.x, this.pos.y, this.distance * 2, this.distance * 2);
    this.sketch.pop();
  }

  movePoints() {
    Object.keys(this.points).forEach((key) => {
      const point = this.points[key];
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

  drawRadius() {
    this.sketch.push();
    this.sketch.stroke(this.sketch.getStroke());
    this.sketch.strokeWeight(1);
    this.sketch.noFill();
    Object.keys(this.points).forEach((key) => {
      const point = this.points[key];
      this.sketch.circle(
        point.pos.x,
        point.pos.y,
        Number(this.sketch.config.linkRadius.value)
      );
    });
    this.sketch.pop();
  }

  createParticles() {
    for (let i = 0; i < Number(this.sketch.config.particleNumber.value); i++) {
      const particle = this.createParticle();
      this.points[particle.id] = particle;
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
      Number(this.sketch.config.particleSpeed.value),
      Number(this.sketch.config.particleSpeed.value)
    );
    const particle = new Particle(position, direction, velocity);
    return particle;
  }

  inXBounds(point: Particle) {
    return (
      point.pos.x > this.pos.x - this.distance + this.padding &&
      point.pos.x < this.pos.x + this.distance - this.padding
    );
  }

  addParticle() {
    const particle = this.createParticle();
    this.points[particle.id] = particle;
  }

  removeParticle() {
    const [randomPoint] = Object.keys(this.points);
    const point = this.points[randomPoint];
    point.links.forEach((linked) => {
      linked.removeLink(point);
    });
    point.edges.forEach((edgeId) => {
      delete this.edges[edgeId];
    });
    delete this.points[randomPoint];
  }

  inYBounds(point: Particle) {
    return (
      point.pos.y > this.pos.y - this.distance + this.padding &&
      point.pos.y < this.pos.y + this.distance - this.padding
    );
  }

  drawPoints() {
    this.sketch.push();
    Object.keys(this.points).forEach((key) => {
      const point = this.points[key];
      this.sketch.stroke(this.sketch.getBackground());
      this.sketch.strokeWeight(10);
      this.sketch.point(point.pos);
      this.sketch.stroke(this.sketch.getStroke());
      this.sketch.strokeWeight(5);
      this.sketch.point(point.pos);
    });
    this.sketch.pop();
  }

  updateSpeed() {
    Object.keys(this.points).forEach((key) => {
      const point = this.points[key];
      const newVelocity = this.sketch.createVector(
        Number(this.sketch.config.particleSpeed.value) *
          this.sketch.getSign(point.velocity.x),
        Number(this.sketch.config.particleSpeed.value) *
          this.sketch.getSign(point.velocity.y)
      );
      point.velocity = newVelocity;
    });
  }
}
