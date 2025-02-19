import { Color, Q5 } from 'q5xts';
import { Menu } from './Menu';
import { Crystal } from './Crystal';

interface Config {
  displayPoints: boolean;
  displayBorder: boolean;
  pause: boolean;
  particleSpeed: number;
  particleNumber: number;
  distance: number;
  linkRadius: number;
  backgroundColor: Color;
  color: Color;
  bRed: number;
  bGreen: number;
  bBlue: number;
  red: number;
  green: number;
  blue: number;
}

const defaultConfig: Config = {
  displayPoints: false,
  displayBorder: false,
  pause: false,
  particleSpeed: 0.2,
  particleNumber: 25,
  distance: 200,
  linkRadius: 250,
  backgroundColor: new Color(255, 255, 225, 1),
  bRed: 255,
  bGreen: 255,
  bBlue: 225,
  red: 210,
  green: 119,
  blue: 95,
  color: new Color(210, 119, 95, 1),
};

export class Drawing extends Q5 {
  crystal?: Crystal;
  menu?: Menu;
  config: Config;
  constructor() {
    super('');
    this.config = defaultConfig;
    const startingPosition = this.createVector(this.width / 2, this.height / 2);
    this.crystal = new Crystal(this, startingPosition);
    this.menu = new Menu(this);
    this.setup = () => {
      this.pixelDensity(2);
      this.strokeWeight(5);
      this.frameRate(60);
      // @ts-expect-error fix this in the next q5xts version
      this.rectMode(this.CENTER);
      this.background(this.config.backgroundColor);
      this.crystal?.draw();
    };
    this.draw = () => {
      this.background(this.config.backgroundColor);
      this.crystal?.draw();
    };
  }

  initCrystal() {
    const startingPosition = this.createVector(this.width / 2, this.height / 2);
    this.crystal = new Crystal(this, startingPosition);
  }

  reset() {
    this.width = this.parent.clientWidth;
    this.height = this.parent.clientHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.config = defaultConfig;
    this.initCrystal();
  }

  random(max: number, min: number) {
    return Math.floor(this.lerp(max, min, Math.random()));
  }

  randomVector(xMax: number, xMin: number, yMax: number, yMin: number) {
    return this.createVector(this.random(xMax, xMin), this.random(yMax, yMin));
  }

  getSign(number: number) {
    return number < 0 ? -1 : 1;
  }
}
