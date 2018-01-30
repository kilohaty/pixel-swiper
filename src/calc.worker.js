onmessage = function (e) {
  const rgbaData  = calcRgbaData(e.data);
  const pixelData = calcPixelData(e.data, rgbaData);
  postMessage(pixelData);
};

function avg(arr) {
  if (!arr || !arr.length) return 0;
  return arr.reduce((a, b) => a + b) / arr.length;
}

function calcRgbaData(data = {}) {
  const imageData = data.imageData;
  const width     = data.width;
  const res       = [];
  for (let i = 0; i < imageData.length; i += 4) {
    if (i / 4 % width === 0) {
      res.push([]);
    }
    res[res.length - 1].push([imageData[i], imageData[i + 1], imageData[i + 2], imageData[i + 3]]);
  }
  return res;
}

function calcPixelData(data, rgbaData) {
  const res    = [];
  const size   = data.size;
  const colNum = Math.ceil(data.width / size);
  const rowNum = Math.ceil(data.height / size);

  for (let i = 0; i < rowNum; i++) {
    res.push([]);
    for (let j = 0; j < colNum; j++) {
      const startCol = size * i;
      const startRow = size * j;
      let squareData = [];
      for (let m = startCol; m < startCol + size; m++) {
        for (let n = startRow; n < startRow + size; n++) {
          if (rgbaData[m] && rgbaData[m][n]) {
            squareData.push(rgbaData[m][n]);
          } else {
            squareData.push([0, 0, 0, 0]);
          }
        }
      }

      squareData = squareData.filter(d => d[3]);
      const avgR = avg(squareData.map(d => d[0]));
      const avgG = avg(squareData.map(d => d[1]));
      const avgB = avg(squareData.map(d => d[2]));
      const avgA = avg(squareData.map(d => d[3]));
      res[i].push({
        r: Math.round(avgR),
        g: Math.round(avgG),
        b: Math.round(avgB),
        a: Math.round(avgA),
      });
    }
  }
  return res;
}
