import { Color, Q5 } from 'q5xts';
import { Menu } from './Menu';
import { Crystal } from './Crystal';

const menu = true;

export interface ConfigItem {
  value: number | boolean | Color;
  min?: number;
  max?: number;
  step?: number;
}

interface Config {
  [id: string]: ConfigItem;
}
// interface Config {
//   displayRadius: boolean;
//   displayPoints: boolean;
//   displayBorder: boolean;
//   pause: boolean;
//   particleSpeed: number;
//   particleNumber: number;
//   distance: number;
//   linkRadius: number;
//   backgroundColor: Color;
//   color: Color;
//   bRed: number;
//   bGreen: number;
//   bBlue: number;
//   red: number;
//   green: number;
//   blue: number;
// }

// each config menu item should have it's own stuff?

// we can make the menu out of this config too
const defaultConfig: Config = {
  displayRadius: {
    value: false,
  },
  displayPoints: {
    value: false,
  },
  displayBorder: {
    value: false,
  },
  displayLinks: {
    value: false,
  },
  displayEdges: {
    value: true,
  },
  pause: {
    value: false,
  },
  particleSpeed: {
    value: 0.3,
    step: 0.1,
    min: 0.1,
    max: 2,
  },
  particleNumber: {
    value: 25,
    min: 5,
    max: 100,
    step: 5,
  },
  distance: { value: 200, max: 200, min: 100, step: 10 },
  linkRadius: { value: 200, max: 300, min: 100, step: 10 },
  bRed: { max: 255, min: 0, step: 5, value: 255 },
  bGreen: { max: 255, min: 0, step: 5, value: 255 },
  bBlue: { max: 255, min: 0, step: 5, value: 225 },
  red: { max: 255, min: 0, step: 5, value: 210 },
  green: { max: 255, min: 0, step: 5, value: 119 },
  blue: { max: 255, min: 0, step: 5, value: 95 },

  backgroundColor: {
    value: new Color(255, 255, 225, 1),
  },
  color: { value: new Color(210, 119, 95, 1) },
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
    if (menu) {
      this.menu = new Menu(this);
    }
    this.setup = () => {
      this.pixelDensity(2);
      this.strokeWeight(5);
      this.frameRate(60);
      // @ts-expect-error fix this in the next q5xts version
      this.rectMode(this.CENTER);
      this.background(this.getBackground());
      this.crystal?.draw();
    };
    this.draw = () => {
      this.background(this.getBackground());
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

  getBackground(): Color {
    const { bRed: red, bGreen: green, bBlue: blue } = this.config;
    const color = new Color(
      Number(red.value),
      Number(green.value),
      Number(blue.value),
      1
    );
    return color;
  }

  getStroke(): Color {
    const { red, green, blue } = this.config;
    const color = new Color(
      Number(red.value),
      Number(green.value),
      Number(blue.value),
      1
    );
    return color;
  }
}
