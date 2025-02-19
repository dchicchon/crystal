import { Vector } from 'q5xts';
import { Drawing } from './Drawing';

export class Menu {
  sketch: Drawing;
  pos: Vector;

  constructor(sketch: Drawing) {
    this.sketch = sketch;
    this.pos = this.sketch.createVector(25, 25);

    const html = `
        <div>
          <h1>Crystals</h1>
          <input value="${this.sketch.config.linkRadius}" step="25" min="0" max="500" type='range' id='link_radius'>Link Radius</input>
          <input value="${this.sketch.config.particleNumber}" step="5" min="0" max="50" type='range' id='particle_number'>Particle Number</input>
          <input value="${this.sketch.config.particleSpeed}" step="0.1" min="0.1" max="2" type='range' id='particle_speed'>Speed</input>
          <button id='display_points' >Display Points</button>
          <button id='display_border' >Display Border</button>
          <button id='pause'>Pause</button>
          <button id='reset'>Reset</button>
        </div>
      `;

    const box = document.createElement('div');
    box.innerHTML = html;
    box.style.backgroundColor = '#d9e0e5';
    box.style.width = '200px';
    box.style.position = 'absolute';
    box.style.top = '0';
    box.style.left = '0';
    this.sketch.parent.appendChild(box);
    const linkRadius = document.getElementById('link_radius');
    const particleSpeed = document.getElementById('particle_speed');
    const particleNumber = document.getElementById('particle_number');
    const displayPoints = document.getElementById('display_points');
    const displayBorder = document.getElementById('display_border');
    const pause = document.getElementById('pause');
    const reset = document.getElementById('reset');

    // @ts-expect-error elemnt may not exist
    linkRadius.onchange = (e) => {
      // @ts-expect-error unknown value type
      const value = e.target.value;
      this.sketch.config.linkRadius = parseInt(value);
    };
    // @ts-expect-error elemnt may not exist
    particleNumber.onchange = (e) => {
      // @ts-expect-error unknown value type
      const value = e.target.value;
      const currentNumber = this.sketch.config.particleNumber;
      const newVal = parseInt(value);
      const diff = currentNumber - newVal;
      this.sketch.config.particleNumber = newVal;
      if (diff < 0) {
        for (let i = 0; i < Math.abs(diff); i++) {
          this.sketch.crystal?.addParticle();
        }
      } else {
        for (let i = 0; i < diff; i++) {
          this.sketch.crystal?.removeParticle();
        }
      }
    };
    // @ts-expect-error elemnt may not exist
    particleSpeed.onchange = (e) => {
      // @ts-expect-error unknown value type
      const value = e.target.value;
      this.sketch.config.particleSpeed = parseFloat(value);
      this.sketch.crystal?.updateSpeed();
    };
    // @ts-expect-error elemnt may not exist
    displayPoints.onclick = () => {
      this.sketch.config.displayPoints = !this.sketch.config.displayPoints;
    };
    // @ts-expect-error elemnt may not exist
    displayBorder.onclick = () => {
      this.sketch.config.displayBorder = !this.sketch.config.displayBorder;
    };
    // @ts-expect-error elemnt may not exist
    pause.onclick = () => {
      this.sketch.config.pause = !this.sketch.config.pause;
    };
    // @ts-expect-error elemnt may not exist
    reset.onclick = () => {
      this.sketch.reset();
    };
  }
}
