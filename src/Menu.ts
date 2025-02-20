import { Vector } from 'q5xts';
import { Drawing } from './Drawing';

export class Menu {
  sketch: Drawing;
  pos: Vector;
  elm: HTMLElement;

  constructor(sketch: Drawing) {
    this.sketch = sketch;
    this.pos = this.sketch.createVector(25, 25);
    this.elm = document.createElement('div');

    this.elm.style.backgroundColor = '#d9e0e5';
    this.elm.style.width = '200px';
    this.elm.style.position = 'absolute';
    this.elm.style.top = '0';
    this.elm.style.left = '0';
    this.sketch.parent.appendChild(this.elm);

    Object.keys(this.sketch.config).forEach((key) => {
      this.createElement(key);
    });
  }

  createElement(key: string) {
    const configItem = this.sketch.config[key];
    const container = document.createElement('div');
    if (typeof configItem.value === 'number') {
      const elm = document.createElement('input');
      elm.type = 'range';
      elm.min = String(configItem.min);
      elm.max = String(configItem.max);
      elm.step = String(configItem.step);
      elm.value = String(configItem.value);
      elm.onchange = (e) => {
        const originalVal = Number(this.sketch.config[key].value);
        const value = parseFloat(e.target!.value);
        this.sketch.config[key].value = value;
        if (key === 'particleSpeed') {
          this.sketch.crystal?.updateSpeed();
        } else if (key === 'particleNumber') {
          const diff = originalVal - value;
          if (diff > 0) {
            for (let i = 0; i < diff; i++) {
              this.sketch.crystal?.removeParticle();
            }
          } else {
            for (let i = 0; i < Math.abs(diff); i++) {
              this.sketch.crystal?.addParticle();
            }
          }
        }
      };
      const label = document.createElement('span');
      label.textContent = key;
      container.appendChild(label);
      container.appendChild(elm);
    } else if (typeof configItem.value === 'boolean') {
      const elm = document.createElement('button');
      elm.textContent = key;
      elm.value = String(configItem.value);
      elm.onclick = () => {
        this.sketch.config[key].value = !this.sketch.config[key].value;
      };
      container.appendChild(elm);
    }
    this.elm.appendChild(container);
  }
}
