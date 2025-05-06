import { Vector } from 'q5xts';
import { ConfigType, Drawing } from './Drawing';

export class Menu {
  sketch: Drawing;
  pos: Vector;
  elm: HTMLElement;

  constructor(sketch: Drawing) {
    this.sketch = sketch;
    this.pos = this.sketch.createVector(25, 25);
    this.elm = document.createElement('div');
    this.elm.style.display = this.sketch.config.displayMenu.value ? 'flex' : 'none';
    this.elm.style.backgroundColor = this.sketch.getBackground().toString();
    this.elm.style.padding = '10px';
    this.elm.style.width = '200px';
    this.elm.style.position = 'absolute';
    this.elm.style.flexDirection = 'column';
    this.elm.style.gap = '5px';
    this.elm.style.top = '0';
    this.elm.style.left = '0';
    this.sketch.parent.appendChild(this.elm);
    this.createElements();
  }

  createElements() {
    Object.keys(this.sketch.config).forEach((key) => {
      const configItem = this.sketch.config[key as keyof ConfigType];
      const container = document.createElement('div');
      if (typeof configItem.value === 'number') {
        const elm = document.createElement('input');
        const output = document.createElement('label');
        output.innerHTML = String(configItem.value);
        output.htmlFor = key;
        elm.name = key;
        elm.type = 'range';
        elm.min = String(configItem.min);
        elm.max = String(configItem.max);
        elm.step = String(configItem.step);
        elm.value = String(configItem.value);
        elm.onchange = (e) => {
          const originalVal = Number(configItem.value);
          // @ts-expect-error value exists!
          const value = parseFloat(e.target!.value);
          this.sketch.config[key as keyof ConfigType].value = value;
          output.innerHTML = String(configItem.value);
          if (key === 'particleSpeed') {
            for (const crystal of this.sketch.crystals) {
              crystal.updateSpeed();
            }
          } else if (key === 'particleNumber') {
            const diff = originalVal - value;
            if (diff > 0) {
              for (let i = 0; i < diff; i++) {
                for (const crystal of this.sketch.crystals) {
                  crystal.removeParticle();
                }
              }
            } else {
              for (let i = 0; i < Math.abs(diff); i++) {
                for (const crystal of this.sketch.crystals) {
                  crystal.addParticle();
                }
              }
            }
          }
        };
        const label = document.createElement('span');
        label.textContent = key;
        container.appendChild(label);
        container.appendChild(elm);
        container.appendChild(output);
      } else if (typeof configItem.value === 'boolean') {
        const elm = document.createElement('button');
        elm.style.padding = '5px';
        elm.style.background = this.sketch.config[key as keyof ConfigType].value
          ? this.sketch.getStroke().toString()
          : this.sketch.getBackground().toString();
        elm.style.border = '1px solid';
        elm.style.cursor = 'pointer';
        elm.style.borderRadius = '5px';
        elm.textContent = key;
        elm.value = String(configItem.value);
        elm.onclick = () => {
          this.sketch.config[key as keyof ConfigType].value =
            !this.sketch.config[key as keyof ConfigType].value;

          // also update the background color
          elm.style.background = this.sketch.config[key as keyof ConfigType].value
            ? this.sketch.getStroke().toString()
            : this.sketch.getBackground().toString();
        };
        container.appendChild(elm);
      }
      this.elm.appendChild(container);
    });
  }
}
