const ceil = Math.ceil;
const abs  = Math.abs;
const sqrt = Math.sqrt;
const pow  = Math.pow;

export default class Particle {
  constructor(options) {
    this.set(options);
    this.x  = this.ox;
    this.y  = this.oy;
    this.tx = this.ox;
    this.ty = this.oy;
  }

  set(options) {
    for (let key in options) {
      if (options.hasOwnProperty(key)) {
        this[key] = options[key];
      }
    }
  }
}

Object.assign(Particle.prototype, {
  ox: 0,
  oy: 0,
  x: 0,
  y: 0,
  tx: 0,
  ty: 0,
  row: 0,
  col: 0,
  frameX: 0,
  frameY: 0,
  frameR: 0,
  frameG: 0,
  frameB: 0,
  frameA: 0,
  frameNum: 1,
  shape: 'square',
  oBg: {r: 0, g: 0, b: 0, a: 0},
  bg: {r: 0, g: 0, b: 0, a: 0},
  tBg: {r: 0, g: 0, b: 0, a: 0},
  size: 1,
  layer: 0,
  velocity: 1,

  reCalc() {
    const framePosition = ceil(sqrt(pow(this.tx - this.x, 2) + pow(this.ty - this.y, 2)) / this.velocity) || 1;
    const frameBgR      = ceil((this.tBg.r - this.bg.r) / this.velocity) || 1;
    const frameBgG      = ceil((this.tBg.g - this.bg.g) / this.velocity) || 1;
    const frameBgB      = ceil((this.tBg.b - this.bg.b) / this.velocity) || 1;
    const frameBgA      = ceil((this.tBg.a - this.bg.a) / this.velocity) || 1;
    this.frameNum       = Math.max(60, framePosition, frameBgR, frameBgG, frameBgB, frameBgA);
    this.frameX         = (this.tx - this.x) / this.frameNum || 0;
    this.frameY         = (this.ty - this.y) / this.frameNum || 0;
    this.frameR         = (this.tBg.r - this.bg.r) / this.frameNum || 0;
    this.frameG         = (this.tBg.g - this.bg.g) / this.frameNum || 0;
    this.frameB         = (this.tBg.b - this.bg.b) / this.frameNum || 0;
    this.frameA         = (this.tBg.a - this.bg.a) / this.frameNum || 0;
  },

  shouldUpdate() {
    return this.bg.a &&
      (this.x !== this.tx
        || this.y !== this.ty
        || this.bg.r !== this.tBg.r
        || this.bg.g !== this.tBg.g
        || this.bg.b !== this.tBg.b
        || this.bg.a !== this.tBg.a
      );
  },

  update() {
    const xUpdate = this.x !== this.tx;
    const yUpdate = this.y !== this.ty;
    const rUpdate = this.bg.r !== this.tBg.r;
    const gUpdate = this.bg.g !== this.tBg.g;
    const bUpdate = this.bg.b !== this.tBg.b;
    const aUpdate = this.bg.a !== this.tBg.a;
    if (xUpdate) {
      if (abs(this.tx - this.x) < abs(this.frameX)) {
        this.x = this.tx;
        return;
      }
      this.x += this.frameX;
    }
    if (yUpdate) {
      if (abs(this.ty - this.y) < abs(this.frameY)) {
        this.y = this.ty;
        return;
      }
      this.y += this.frameY;
    }
    if (rUpdate) {
      if (abs(this.tBg.r - this.bg.r) < abs(this.frameR)) {
        this.bg.r = this.tBg.r;
        return;
      }
      this.bg.r += this.frameR;
    }
    if (gUpdate) {
      if (abs(this.tBg.g - this.bg.g) < abs(this.frameG)) {
        this.bg.g = this.tBg.g;
        return;
      }
      this.bg.g += this.frameG;
    }
    if (bUpdate) {
      if (abs(this.tBg.b - this.bg.b) < abs(this.frameB)) {
        this.bg.b = this.tBg.b;
        return;
      }
      this.bg.b += this.frameB;
    }
    if (aUpdate) {
      if (abs(this.tBg.a - this.bg.a) < abs(this.frameA)) {
        this.bg.a = this.tBg.a;
        return;
      }
      this.bg.a += this.frameA;
    }
  },

  render({ctx}) {
    if (ctx instanceof CanvasRenderingContext2D && this.bg.a) {
      if (this.bg.a) ctx.globalAlpha = this.bg.a / 255;
      ctx.fillStyle = `rgb(${~~this.bg.r},${~~this.bg.g},${~~this.bg.b})`;
      this.renderShape(ctx);
    }
  },

  renderShape(ctx) {
    if (this.shape === 'square') {
      ctx.fillRect(~~(this.x - this.size / 2), ~~(this.y - this.size / 2), this.size, this.size);
    } else if (this.shape === 'round') {
      ctx.beginPath();
      ctx.arc(~~this.x, ~~this.y, this.size >> 1 || 1, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
    }
  },

});