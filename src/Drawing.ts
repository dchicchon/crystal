import { Color, Q5, Vector } from 'q5xts';
import { Menu } from './Menu';
import { Crystal } from './Crystal';
// import { Particle } from './Particle';

export interface ConfigItem {
  value: number | boolean | Color;
  min?: number;
  max?: number;
  step?: number;
}

export interface NumberItem {
  value: number;
  min?: number;
  max?: number;
  step?: number;
}
export interface ConfigType {
  displayMenu: ConfigItem;
  displayBorder: ConfigItem;
  displayPoints: ConfigItem;
  displayLinks: ConfigItem;
  displayEdges: ConfigItem;
  pause: ConfigItem;
  particleSpeed: NumberItem;
  particleNumber: NumberItem;
  distance: NumberItem;
  linkRadius: NumberItem;
  bgRed: NumberItem;
  bgGreen: NumberItem;
  bgBlue: NumberItem;
  red: NumberItem;
  green: NumberItem;
  blue: NumberItem;
}

const defaultConfig: ConfigType = {
  displayMenu: {
    value: true,
  },
  displayBorder: {
    value: true,
  },
  displayPoints: {
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
    value: 0.05,
    step: 0.01,
    min: 0.01,
    max: 1,
  },
  particleNumber: {
    value: 15,
    min: 1,
    max: 25,
    step: 1,
  },
  distance: { value: 100, max: 200, min: 50, step: 10 },
  linkRadius: { value: 200, max: 400, min: 100, step: 20 },
  bgRed: { max: 255, min: 0, step: 5, value: 255 },
  bgGreen: { max: 255, min: 0, step: 5, value: 255 },
  bgBlue: { max: 255, min: 0, step: 5, value: 225 },
  red: { max: 255, min: 0, step: 5, value: 210 },
  green: { max: 255, min: 0, step: 5, value: 119 },
  blue: { max: 255, min: 0, step: 5, value: 95 },
};

// GREAT COLORS DO NOT DELETE
const color1 = new Color(210, 119, 95, 1);
const color2 = new Color(210, 200, 95, 1);
const color3 = new Color(100, 119, 200, 1);

export class Drawing extends Q5 {
  crystals: Array<Crystal>;
  menu?: Menu;
  padding: number;
  config: ConfigType;
  constructor() {
    super('');
    this.padding = 5;
    this.config = defaultConfig;

    // divide evenly among the page?
    const pos1 = this.createVector(this.width / 4, this.height / 2);
    const pos2 = this.createVector((this.width / 4) * 2, this.height / 2);
    const pos3 = this.createVector((this.width / 4) * 3, this.height / 2);
    const crystal1 = this.initCrystal(pos1, color1);
    const crystal2 = this.initCrystal(pos2, color2);
    const crystal3 = this.initCrystal(pos3, color3);
    this.crystals = [crystal1, crystal2, crystal3];

    this.menu = new Menu(this);
    this.setup = () => {
      this.pixelDensity(window.devicePixelRatio);
      this.strokeWeight(5);
      this.frameRate(60);
      // @ts-expect-error fix this in the next q5xts version
      this.rectMode(this.CENTER);
      this.background(this.getBackground());
      for (const crystal of this.crystals) {
        crystal.draw();
      }
    };
    this.draw = () => {
      this.background(this.getBackground());
      for (const crystal of this.crystals) {
        crystal.draw();
      }
    };
  }

  reset() {
    this.width = this.parent.clientWidth;
    this.height = this.parent.clientHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.config = defaultConfig;
    // this.crystal = this.initCrystal();
  }

  initCrystal(pos: Vector, color: Color): Crystal {
    return new Crystal(this, pos, color);
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

  getBackground(): Color {
    const { bgRed, bgGreen, bgBlue } = this.config;
    return new Color(bgRed.value, bgGreen.value, bgBlue.value, 1);
  }

  getStroke(): Color {
    const { red, green, blue } = this.config;
    return new Color(red.value, green.value, blue.value, 1);
  }
}
