import Particle from './particle';
import calc from './calc';

window.requestAnimationFrame = window.requestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.msRequestAnimationFrame;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image   = new Image();
    image.onload  = resolve.bind(null, image);
    image.onerror = reject;
    image.src     = src;
  });
}

function randomInt(min, max) {
  return ~~(Math.random() * (max - min) + min);
}

function getRandomColor() {
  return '#' + Array.apply(null, new Array(3)).map(() => {
    return randomInt(0, 255).toString(16).replace(/^(\w{1})$/, '0$1');
  }).join('');
}

class PixelSwiper {
  constructor(selector, options) {
    this.set(options);
    this.initialize(selector);
  }
}

Object.assign(PixelSwiper.prototype, {

  width: 0,

  height: 0,

  paddingLeft: 0,

  paddingTop: 0,

  rowNum: 0,

  colNum: 0,

  swipeList: [],

  collections: [],

  lastIndex: -1,

  index: 0,

  animation: true,

  randomPosition: false,

  shape: 'square',

  velocity: 1,

  particleSize: 20,

  onIndexChange: null,

  workerPath: '',

  useWebWorker: false,

  set(options) {
    for (let key in options) {
      if (options.hasOwnProperty(key)) {
        this[key] = options[key];
      }
    }
  },

  initialize(selector) {
    const canvas      = document.querySelector(selector);
    const cacheCanvas = document.createElement('canvas');

    this.canvas             = canvas;
    this.cacheCanvas        = cacheCanvas;
    this.ctx                = canvas.getContext('2d');
    this.cacheCtx           = cacheCanvas.getContext('2d');
    this.canvas.width       = this.width;
    this.canvas.height      = this.height;
    this.cacheCanvas.width  = this.width;
    this.cacheCanvas.height = this.height;
    this.rowNum             = Math.ceil(this.height / this.particleSize);
    this.colNum             = Math.ceil(this.width / this.particleSize);
    this.run();
  },

  renderTextToCacheCanvas({text, color, fontSize, randomColor, paddingTop = 0, paddingLeft = 0}) {
    const ctx = this.cacheCtx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.save();
    ctx.textBaseline = 'top';
    ctx.font         = `${fontSize || 12}px 'microsoft yahei light'`;
    ctx.fillStyle    = randomColor ? getRandomColor() : color || '#000000';
    ctx.fillText(text, paddingLeft, paddingTop);
    ctx.restore();
  },

  renderImageToCacheCanvas({url, paddingTop = 0, paddingLeft = 0}) {
    return new Promise(async (resolve, reject) => {
      try {
        const image = await loadImage(url);
        const w     = this.width - (paddingLeft << 1);
        const h     = this.height - (paddingTop << 1);
        let scale   = 1;
        if (image.width > w || image.height > h) {
          scale = image.width / image.height > w / h ? w / image.width : h / image.height;
        }

        if (image.width < w && image.height < h) {
          scale = image.width / image.height > w / h ? w / image.width : h / image.height;
        }

        const imgW = image.width * scale;
        const imgH = image.height * scale;
        const left = (this.width - imgW) >> 1;
        const top  = (this.height - imgH) >> 1;
        const dstX = left > paddingLeft ? left / scale : paddingLeft / scale;
        const dstY = top > paddingTop ? top / scale : paddingTop / scale;
        const ctx  = this.cacheCtx;
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.save();
        ctx.scale(scale, scale);
        ctx.drawImage(image, dstX, dstY);
        ctx.restore();
        resolve();
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  },

  getPixelData(options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        if (options.text) {
          this.renderTextToCacheCanvas(options);
        } else {
          await this.renderImageToCacheCanvas(options);
        }

        const imgData  = this.cacheCtx.getImageData(0, 0, this.width, this.height).data;
        const postData = {
          imageData: imgData,
          width: this.width,
          height: this.height,
          size: this.particleSize,
        };
        if (this.useWebWorker) {
          const worker     = new Worker(this.workerPath);
          worker.onmessage = e => resolve(e.data);
          worker.postMessage(postData);
        } else {
          resolve(calc(postData));
        }
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  },

  getCollectionData() {
    return new Promise(async (resolve, reject) => {
      try {
        const size = this.particleSize;
        for (let i = 0; i < this.swipeList.length; i++) {
          const swipe   = this.swipeList[i];
          let pixelData = await this.getPixelData(swipe);
          const res     = [];
          for (let m = 0; m < this.rowNum; m++) {
            for (let n = 0; n < this.colNum; n++) {
              let data = pixelData[m] && pixelData[m][n];
              if (swipe.randomParticleColor && data.a) {
                data = {r: randomInt(0, 255), g: randomInt(0, 255), b: randomInt(0, 255), a: 255};
              }
              data && res.push({
                ox: size * n + (size >> 1),
                oy: size * m + (size >> 1),
                size: size,
                bg: {r: data.r, g: data.g, b: data.b, a: data.a},
                row: m,
                col: n
              });
            }
          }
          this.swipeList[i].pixelData = res;
        }
        resolve();
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  },

  nextIndex() {
    this.lastIndex = this.index;
    this.index++;
    if (this.index >= this.swipeList.length) {
      this.index = 0;
    }

    this.onIndexChange && this.onIndexChange({index: this.index});
  },

  next() {
    this.nextIndex();
    this.updateCollections();
  },

  loop() {
    const duration = this.swipeList[this.index].duration;
    if (!duration) return;
    setTimeout(() => {
      this.next();
      this.loop();
    }, duration);
  },

  updateCollections() {
    const pixelData = this.swipeList[this.index].pixelData;

    if (this.randomPosition) {
      const data = JSON.parse(JSON.stringify(pixelData));

      function getDataByPos(row, col) {
        let res = null;
        for (let i = 0; i < data.length; i++) {
          const d = data[i];
          if (d.row === row && d.col === col) {
            res = {cell: d, index: i};
            break;
          }
        }
        return res;
      }

      // ignore same pixel
      const ignoreIndex = [];
      this.collections.forEach((p, i) => {
        const cellData = getDataByPos(p.row, p.col);
        if (cellData && cellData.cell && (cellData.cell.bg.a === 0 && p.tBg.a === 0)) {
          data.splice(cellData.index, 1);
          ignoreIndex.push(i);
        }
      });

      this.collections.forEach((p, i) => {
        if (ignoreIndex.indexOf(i) !== -1) return;
        const randomIndex = randomInt(0, data.length);
        const d           = data[randomIndex];
        const bg          = d.bg;
        p.set({
          row: d.row,
          col: d.col,
          tx: d.ox,
          ty: d.oy,
          ox: d.ox,
          oy: d.oy,
          oBg: {r: bg.r, g: bg.g, b: bg.b, a: bg.a},
          tBg: {r: bg.r, g: bg.g, b: bg.b, a: bg.a},
        });
        p.reCalc();
        data.splice(randomIndex, 1);
      });
    } else {
      this.collections.forEach(p => {
        const d  = pixelData[p.row * this.colNum + p.col];
        const bg = d.bg;
        p.set({
          oBg: {r: bg.r, g: bg.g, b: bg.b, a: bg.a},
          tBg: {r: bg.r, g: bg.g, b: bg.b, a: bg.a}
        });
        p.reCalc();
      });
    }
  },

  async run() {
    try {
      await this.getCollectionData();
      const size = this.particleSize;
      for (let i = 0; i < this.rowNum; i++) {
        for (let j = 0; j < this.colNum; j++) {
          this.collections.push(new Particle({
            ox: size * j + (size >> 1),
            oy: size * i + (size >> 1),
            size: size,
            shape: this.shape,
            bg: {r: 0, g: 0, b: 0, a: 0},
            row: i,
            col: j,
            velocity: this.velocity,
          }));
        }
      }

      this.updateCollections();
      this.render();
      this.loop();
      this.loopAnim();
    } catch (err) {
      console.error(err);
    }
  },

  needUpdate() {
    return this.collections.some(p => p.shouldUpdate());
  },

  loopAnim() {
    if (!this.needUpdate()) {
      requestAnimationFrame(this.loopAnim.bind(this));
      return;
    }
    this.render();
    requestAnimationFrame(this.loopAnim.bind(this));
  },

  render() {
    this.cacheCtx.clearRect(0, 0, this.width, this.height);
    this.collections.forEach(p => {
      if (!this.animation) {
        p.set({bg: {r: p.tBg.r, g: p.tBg.g, b: p.tBg.b, a: p.tBg.a}});
      }
      this.cacheCtx.save();
      p.update();
      p.render({ctx: this.cacheCtx});
      this.cacheCtx.restore();
    });
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.drawImage(this.cacheCanvas, 0, 0);
  },
});

module.exports = PixelSwiper;