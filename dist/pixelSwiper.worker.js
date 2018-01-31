!function(root,factory){"object"==typeof exports&&"object"==typeof module?module.exports=factory():"function"==typeof define&&define.amd?define([],factory):"object"==typeof exports?exports.pixelSwiper=factory():root.pixelSwiper=factory()}("undefined"!=typeof self?self:this,function(){return function(modules){function __webpack_require__(moduleId){if(installedModules[moduleId])return installedModules[moduleId].exports;var module=installedModules[moduleId]={i:moduleId,l:!1,exports:{}};return modules[moduleId].call(module.exports,module,module.exports,__webpack_require__),module.l=!0,module.exports}var installedModules={};return __webpack_require__.m=modules,__webpack_require__.c=installedModules,__webpack_require__.d=function(exports,name,getter){__webpack_require__.o(exports,name)||Object.defineProperty(exports,name,{configurable:!1,enumerable:!0,get:getter})},__webpack_require__.n=function(module){var getter=module&&module.__esModule?function(){return module.default}:function(){return module};return __webpack_require__.d(getter,"a",getter),getter},__webpack_require__.o=function(object,property){return Object.prototype.hasOwnProperty.call(object,property)},__webpack_require__.p="",__webpack_require__(__webpack_require__.s=90)}({90:function(module,exports,__webpack_require__){"use strict";function avg(arr){return arr&&arr.length?arr.reduce(function(a,b){return a+b})/arr.length:0}function calcRgbaData(){for(var data=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},imageData=data.imageData,width=data.width,res=[],i=0;i<imageData.length;i+=4)i/4%width==0&&res.push([]),res[res.length-1].push([imageData[i],imageData[i+1],imageData[i+2],imageData[i+3]]);return res}function calcPixelData(data,rgbaData){for(var res=[],size=data.size,colNum=Math.ceil(data.width/size),rowNum=Math.ceil(data.height/size),i=0;i<rowNum;i++){res.push([]);for(var j=0;j<colNum;j++){for(var startCol=size*i,startRow=size*j,squareData=[],m=startCol;m<startCol+size;m++)for(var n=startRow;n<startRow+size;n++)rgbaData[m]&&rgbaData[m][n]?squareData.push(rgbaData[m][n]):squareData.push([0,0,0,0]);squareData=squareData.filter(function(d){return d[3]});var avgR=avg(squareData.map(function(d){return d[0]})),avgG=avg(squareData.map(function(d){return d[1]})),avgB=avg(squareData.map(function(d){return d[2]})),avgA=avg(squareData.map(function(d){return d[3]}));res[i].push({r:Math.round(avgR),g:Math.round(avgG),b:Math.round(avgB),a:Math.round(avgA)})}}return res}onmessage=function(e){var rgbaData=calcRgbaData(e.data),pixelData=calcPixelData(e.data,rgbaData);postMessage(pixelData)}}})});
//# sourceMappingURL=pixelSwiper.worker.js.map