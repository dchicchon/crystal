import { Color, Vector } from 'q5xts';
import { Drawing } from './Drawing';
import { nanoid } from 'nanoid';

// might be better to attach edge ids to this to remove
class Particle {
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
  constructor(points: Array<Particle>, color: Color) {
    this.id = nanoid();
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

  //   should this instead be an object?
  edges: Edges;
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
    this.points = {};
    this.edges = {};
    this.createParticles();
    this.buildLinks();
  }

  // TODO: Use quad tree for faster search
  buildLinks() {
    Object.keys(this.points).forEach((key, i) => {
      const point = this.points[key];
      Object.keys(this.points).forEach((key2, j) => {
        const point2 = this.points[key2];
        if (i === j) return;
        if (point.pos.dist(point2.pos) < this.sketch.config.linkRadius / 2) {
          point.link(point2);
        } else if (point.links.has(point2)) {
          // we should look through our edges to see if we need to break up some
          // edges
          const mutual = point.hasMutual(point2);
          if (mutual) {
            const id = [point.id, mutual.id, point2.id].sort().join('-');
            delete this.edges[id];
          }
          point.removeLink(point2);
          //   point2.removeLink(point);
        }
      });
    });
  }

  filterPointThreshold() {
    // we need to filter this twice? Each time you filter you have to remove the link
    // from the other points
    //TODO: we should not have to run this multiple times. Find better way
    Object.keys(this.points).forEach((key) => {
      const point = this.points[key];
      if (point.links.size < this.linkThreshold) {
        this.removeParticle(key);
      }
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
    // see if 2 points have the same point in common. If not remove the link;
  }

  createParticles() {
    for (let i = 0; i < this.sketch.config.particleNumber; i++) {
      const particle = this.createParticle();
      this.points[particle.id] = particle;
      //   this.points.push(particle);
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

  updateSpeed() {
    Object.keys(this.points).forEach((key) => {
      const point = this.points[key];
      const newVelocity = this.sketch.createVector(
        this.sketch.config.particleSpeed * this.sketch.getSign(point.velocity.x),
        this.sketch.config.particleSpeed * this.sketch.getSign(point.velocity.y)
      );
      point.velocity = newVelocity;
    });
  }

  draw() {
    this.drawShape();
    this.drawEdges();
    // this.drawLines();
    if (this.sketch.config.displayPoints) {
      this.drawPoints();
    }
    if (this.sketch.config.displayRadius) {
      this.drawRadius();
    }
    if (this.sketch.config.displayBorder) {
      this.drawBoundingBox();
    }
    if (this.sketch.config.pause) return;
    this.movePoints();
    this.buildLinks();
  }

  drawLines() {
    this.sketch.stroke(this.sketch.config.backgroundColor);
    this.sketch.strokeWeight(7);
    Object.keys(this.points).forEach((key) => {
      const point = this.points[key];
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

    Object.keys(this.points).forEach((key) => {
      const point = this.points[key];
      const { red, green, blue } = this.sketch.config;
      const color = new Color(red, green, blue, 1);
      this.sketch.fill(color);

      point.links.forEach((linked) => {
        const mutual = point.hasMutual(linked);
        if (!mutual) return;

        const id = [point.id, mutual.id, linked.id].sort().join('-');

        // already exists. dont draw anymore
        if (this.edges[id]) return;

        const { red, green, blue } = this.sketch.config;
        const color = new Color(red, green, blue, Math.random());
        this.sketch.fill(color);
        this.edges[id] = new Edge([point, mutual, linked], color);
        // otherwise add to our existing group of edges
        // we can do a sort on the particle id and that should create the same hash value
        // if area reaches threshold, allow shape to be created
        this.sketch.noStroke();
        this.sketch.beginShape();
        this.sketch.vertex(point.pos.x, point.pos.y);
        this.sketch.vertex(mutual.pos.x, mutual.pos.y);
        this.sketch.vertex(linked.pos.x, linked.pos.y);
        this.sketch.endShape(this.sketch.CLOSE);
        this.sketch.stroke(this.sketch.config.backgroundColor);
        // add the shape's id to an object. if found before, then dont build this shape again
        // until the next frame?
      });
    });
    this.sketch.pop();
  }

  drawEdges() {
    Object.keys(this.edges).forEach((key) => {
      const edge = this.edges[key];
      this.sketch.noStroke();
      this.sketch.fill(edge.color);
      const [point1, point2, point3] = edge.points;
      this.sketch.beginShape();
      this.sketch.vertex(point1.pos.x, point1.pos.y);
      this.sketch.vertex(point2.pos.x, point2.pos.y);
      this.sketch.vertex(point3.pos.x, point3.pos.y);
      this.sketch.endShape(this.sketch.CLOSE);
    });
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
    this.points[particle.id] = particle;
  }

  removeParticle(key: string) {
    // before we delete this particle we need to clean up any links and edges
    const point = this.points[key];
    point.links.forEach((linked) => {
      linked.removeLink(point);
    });
    point.edges.forEach((edgeId) => {
      delete this.edges[edgeId];
    });
    delete this.points[key];

    // const particle = this.points[index] || this.points.pop();
    // // might be better to make a point an object instead?
    // if (index) {
    //   this.points.splice(index, 1);
    // }
    // particle?.edges.forEach((edgeId: string) => {
    //   delete this.edges[edgeId];
    // });
    // particle?.links.forEach((linked: Particle) => {
    //   linked.removeLink(particle);
    // });
  }

  // TODO: how can i implement this in future?
  grow() {}

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

  drawRadius() {
    this.sketch.push();
    const { red, green, blue } = this.sketch.config;
    const color = new Color(red, green, blue, 1);
    this.sketch.stroke(color);
    this.sketch.strokeWeight(1);
    this.sketch.noFill();
    Object.keys(this.points).forEach((key) => {
      const point = this.points[key];
      this.sketch.circle(point.pos.x, point.pos.y, this.sketch.config.linkRadius);
    });
    this.sketch.pop();
  }

  drawPoints() {
    this.sketch.push();
    const { red, green, blue } = this.sketch.config;
    const color = new Color(red, green, blue, 1);
    this.sketch.stroke(color);
    this.sketch.noFill();
    Object.keys(this.points).forEach((key) => {
      const point = this.points[key];
      // this.sketch.circle(point.pos.x, point.pos.y, this.sketch.config.linkRadius);
      this.sketch.point(point.pos);
    });
    this.sketch.pop();
  }
}
