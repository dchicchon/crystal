// implement quadtree to check points
import { Particle } from './Crystal';

class Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  contains(point: Particle) {
    return (
      point.pos.x >= this.x - this.width &&
      point.pos.x <= this.x + this.width &&
      point.pos.y >= this.y - this.height &&
      point.pos.y <= this.y + this.height
    );
  }

  intersects(range: Rectangle) {
    return !(
      range.x - range.width > this.x + this.width ||
      range.x + range.width < this.x - this.width ||
      range.y - range.height > this.y + this.height ||
      range.y + range.height < this.y - this.height
    );
  }
}

export class QuadTree {
  boundary: Rectangle;
  capacity: number;
  points: Array<Particle>;
  divided: boolean;
  northeast?: QuadTree;
  northwest?: QuadTree;
  southwest?: QuadTree;
  southeast?: QuadTree;

  constructor(boundary: Rectangle, capacity: number) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;
  }

  subdivide() {
    const { x, y, width, height } = this.boundary;
    this.northeast = new QuadTree(
      new Rectangle(x + width / 2, y - height / 2, width / 2, height / 2),
      this.capacity
    );
    this.northwest = new QuadTree(
      new Rectangle(x - width / 2, y - height / 2, width / 2, height / 2),
      this.capacity
    );
    this.southeast = new QuadTree(
      new Rectangle(x + width / 2, y + height / 2, width / 2, height / 2),
      this.capacity
    );
    this.southwest = new QuadTree(
      new Rectangle(x - width / 2, y + height / 2, width / 2, height / 2),
      this.capacity
    );
    this.divided = true;
  }

  insert(point: Particle) {
    if (!this.boundary.contains(point)) return;

    if (this.points.length < this.capacity) {
      this.points.push(point);
      return;
    }

    if (!this.divided) {
      this.subdivide();
    }
    this.northeast?.insert(point);
    this.northwest?.insert(point);
    this.southeast?.insert(point);
    this.southwest?.insert(point);
  }

  query(range, found) {}
}
