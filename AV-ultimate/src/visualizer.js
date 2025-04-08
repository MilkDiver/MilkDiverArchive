// visualizer.js
// Desc.: Creates and draws a visualizer for the audio based on user inputs.
// Written by: Jack Moyen
// Last Updated: March 2025
// Reformatted by AI. Obviously.

import * as utils from './utils.js';
import * as sprite from './sprite.js';

let canvas, ctx, canvasWidth, canvasHeight, gradient, analyserNode, audioData, spriteLeft, spriteRight;

//Basic canvas setup
const setupCanvas = (canvasElement, analyserNodeRef) => {
  ctx = canvasElement.getContext("2d");
  canvasWidth = canvasElement.width;
  canvasHeight = canvasElement.height;
  
  gradient = utils.getLinearGradient(ctx, 0, 0, 0, canvasHeight, [
    { percent: 0, color: "#000761"},
    { percent: .15, color: "#44008B" },
    { percent: 0.35, color: "#9F45B0" },
    { percent: 0.5, color: "#E54ED0" },
    { percent: 0.65, color: "#9F45B0" },
    { percent: .85, color: "#44008B" },
    { percent: 1, color: "#000761"}
  ]);

  //Sprite setup
  spriteLeft = new sprite.Sprite(-30, Math.random() * canvasHeight, 30, "#B5C0C9", canvasWidth, canvasHeight);
  spriteRight = new sprite.Sprite(-50, Math.random() * canvasHeight, 30, "#B5C0C9", canvasWidth, canvasHeight);

  analyserNode = analyserNodeRef;
  audioData = new Uint8Array(analyserNode.fftSize / 2);
};

//Draws the visualizer for the audio based on user inputs.
const draw = (params = {}) => {
  analyserNode.getByteFrequencyData(audioData);

  ctx.save();
  ctx.fillStyle = "black";
  ctx.globalAlpha = 0.1;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.restore();

  // Specifications based on user inputs
  if (params.gradient) {
    ctx.save();
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
  }

  if (params.waveform) {
    analyserNode.getByteTimeDomainData(audioData);

    ctx.beginPath();

    let sliceWidth = (canvas?.width || 800) / audioData.length;
    let x = 0;

    for (let i = 0; i < audioData.length; i++) {
      let v = audioData[i] / 128.0;
      let y = v * (canvas?.height || 400) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#E54ED0";
    ctx.stroke();
  } else {
    if (params.bars) {
      let barSpacing = 4;
      let margin = 5;
      let screenWidthForBars = canvasWidth - (audioData.length * barSpacing) - margin * 2 + 5;
      let barWidth = screenWidthForBars / audioData.length;
      let barHeight = 200;
      let topSpacing = 100;

      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.50)';
      ctx.strokeStyle = 'rgba(0,0,0,0.50)';

      for (let i = 0; i < audioData.length; i++) {
        ctx.fillRect(margin + i * (barWidth + barSpacing), topSpacing + 256 - audioData[i], barWidth, barHeight);
        ctx.strokeRect(margin + i * (barWidth + barSpacing), topSpacing + 256 - audioData[i], barWidth, barHeight);
      }

      ctx.restore();
    }

    if (params.circles) {
      let maxRadius = canvasHeight / 4;
      ctx.save();
      ctx.globalAlpha = 0.5;

      for (let i = 0; i < audioData.length; i++) {
        let percent = audioData[i] / 255;
        let circleRadius = percent * maxRadius;

        ctx.beginPath();
        ctx.fillStyle = utils.makeColor(68, 0, 139, 0.34 - percent / 3.0);
        ctx.arc(canvasWidth / 2, canvasHeight / 2, circleRadius, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.fillStyle = utils.makeColor(159, 69, 176, 0.1 - percent / 10.0);
        ctx.arc(canvasWidth / 2, canvasHeight / 2, circleRadius * 1.5, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.closePath();

        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = utils.makeColor(229, 78, 208, 0.5 - percent / 5.0);
        ctx.arc(canvasWidth / 2, canvasHeight / 2, circleRadius * 0.5, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
      }

      ctx.restore();
    }
  }
  
  if (params.ships) {
    //Applies sprites
    spriteLeft.update(audioData);
    spriteRight.update(audioData);
    spriteLeft.draw(ctx);
    spriteRight.draw(ctx);
  }

  let imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  let data = imageData.data;
  let length = data.length;
  let width = imageData.width;

  for (let i = 0; i < length; i += 4) {
    if (params.noise && Math.random() < 0.05) {
      data[i] = data[i + 1] = data[i + 2] = 100;
      data[i] = 100;
    }

    if (params.invert) {
      let red = data[i], green = data[i + 1], blue = data[i + 2];
      data[i] = 255 - red;
      data[i + 1] = 255 - green;
      data[i + 2] = 255 - blue;
    }
  }

  if (params.emboss) {
    for (let i = 0; i < length; i++) {
      if (i % 4 === 3) continue;
      data[i] = 127 + 2 * data[i] - data[i + 4] - data[i + width * 4];
    }
  }



  ctx.putImageData(imageData, 0, 0);
};

export { setupCanvas, draw };
