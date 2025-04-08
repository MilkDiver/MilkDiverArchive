// main.js
// Desc.: Sets up the main event loop and hooks up UI
// Written by: Jack Moyen
// Last Updated: March 2025
// Reformatted by AI. Obviously.

import * as utils from './utils.js';
import * as audio from './audio.js';
import * as canvas from './visualizer.js';

let drawParams = {
  waveform: false,
  gradient: false,
  bars: false,
  circles: false,
  ships: false,
  noise: false,
  invert: false,
  emboss: false
};

const DEFAULTS = Object.freeze({
  sound1: "media/Peanuts Theme.mp3"
});

//Initial setup loop
const init = (data) => {
  //Basic setup
  audio.setupWebAudio(DEFAULTS.sound1);
  console.log("init called");

  //Canvas and UI setup
  let canvasElement = document.querySelector("canvas");
  setupUI(canvasElement, data);
  canvas.setupCanvas(canvasElement, audio.analyserNode);
  //Animation loop
  animate();
};

const setupUI = (canvasElement, data) => {

  //Imported Data
  document.querySelector("#title-Main").innerHTML = data.title;
	const audioImport = data.audio;
	const audioTitles = data.audioTitles;
  //Imported Track Select
  let trackSelect = document.querySelector("#trackSelect");
  for (let i = 0; i < audioImport.length; i++) {
    trackSelect.innerHTML += `<option value="${audioImport[i]}">${audioTitles[i]}</option>`;
  }
  //Imported Parameters
	drawParams = data.startupParams;
  Object.keys(drawParams).forEach(key => {
    if (drawParams[key]) {
        document.querySelector(`#cb-${key}`).checked = true;
    }
  });

  //Fullscreen button
  const fsButton = document.querySelector("#btn-fs");
  fsButton.onclick = () => utils.goFullscreen(canvasElement);

  //Play button
  const playButton = document.querySelector("#btn-play");
  playButton.onclick = (e) => {
    if (audio.audioCtx.state === "suspended") {
      audio.audioCtx.resume();
    }

    if (e.target.dataset.playing === "no") {
      audio.playCurrentSound();
      e.target.dataset.playing = "yes";
    } else {
      audio.pauseCurrentSound();
      e.target.dataset.playing = "no";
    }
  };

  //Volume slider
  let volumeSlider = document.querySelector("#slider-volume");
  let volumeLabel = document.querySelector("#volumeLabel");
  volumeSlider.oninput = (e) => {
    audio.setVolume(e.target.value);
    volumeLabel.innerHTML = Math.round((e.target.value / 2) * 100);
  };
  volumeSlider.dispatchEvent(new Event("input"));

  //Track select
  trackSelect.onchange = (e) => {
    audio.loadSoundFile(e.target.value);
    if (playButton.dataset.playing === "yes") {
      playButton.dispatchEvent(new MouseEvent("click"));
    }
  };

  //Checkbox setup
  let waveformCB = document.querySelector("#cb-waveform");
  let gradientCB = document.querySelector("#cb-gradient");
  let barsCB = document.querySelector("#cb-bars");
  let circlesCB = document.querySelector("#cb-circles");
  let shipsCB = document.querySelector("#cb-ships");
  let noiseCB = document.querySelector("#cb-noise");
  let invertCB = document.querySelector("#cb-invert");
  let embossCB = document.querySelector("#cb-emboss");

  waveformCB.onchange = () => { drawParams.waveform = waveformCB.checked; };
  gradientCB.onchange = () => { drawParams.gradient = gradientCB.checked; };
  barsCB.onchange = () => { drawParams.bars = barsCB.checked; };
  circlesCB.onchange = () => { drawParams.circles = circlesCB.checked; };
  shipsCB.onchange = () => { drawParams.ships = shipsCB.checked; };
  noiseCB.onchange = () => { drawParams.noise = noiseCB.checked; };
  invertCB.onchange = () => { drawParams.invert = invertCB.checked; };
  embossCB.onchange = () => { drawParams.emboss = embossCB.checked; };

  //Biquad Filters
  let highshelf = false;
  let lowshelf = false;

  const toggleHighshelf = () => {
    if (highshelf) {
      audio.biquadFilterNode.frequency.setValueAtTime(1000, audio.audioCtx.currentTime);
      audio.biquadFilterNode.gain.setValueAtTime(10, audio.audioCtx.currentTime);
    } else {
      audio.biquadFilterNode.gain.setValueAtTime(0, audio.audioCtx.currentTime);
    }
  };

  const toggleLowshelf = () => {
    if (lowshelf) {
      audio.lowShelfBiquadFilterNode.frequency.setValueAtTime(1000, audio.audioCtx.currentTime);
      audio.lowShelfBiquadFilterNode.gain.setValueAtTime(10, audio.audioCtx.currentTime);
    } else {
      audio.lowShelfBiquadFilterNode.gain.setValueAtTime(0, audio.audioCtx.currentTime);
    }
  };

  document.querySelector('#cb-highshelf').checked = highshelf;
  document.querySelector('#cb-highshelf').onchange = (e) => {
    highshelf = e.target.checked;
    toggleHighshelf();
  };
  toggleHighshelf();

  document.querySelector('#cb-lowshelf').checked = lowshelf;
  document.querySelector('#cb-lowshelf').onchange = (e) => {
    lowshelf = e.target.checked;
    toggleLowshelf();
  };
  toggleLowshelf();

  //Distortion
  let distortionSlider = document.querySelector("#slider-distortion");
  let distortionLabel = document.querySelector("#distortionLabel");
  let distortionAmount = 0;

  const makeDistortionCurve = (amount = 20) => {
    let n_samples = 256, curve = new Float32Array(n_samples);
    for (let i = 0; i < n_samples; ++i) {
      let x = i * 2 / n_samples - 1;
      curve[i] = (Math.PI + amount) * x / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  };

  const toggleDistortion = () => {
    if (distortionAmount > 0) {
      audio.distortionFilterNode.curve = makeDistortionCurve(distortionAmount);
    } else {
      audio.distortionFilterNode.curve = new Float32Array([0, 0, 0]);
    }
  };

  distortionSlider.value = distortionAmount;
  distortionSlider.oninput = (e) => {
    distortionAmount = Number(e.target.value) * 20 - .1999;
    distortionLabel.innerHTML = Math.round((e.target.value / 2) * 100);
    toggleDistortion();
  };
  distortionSlider.dispatchEvent(new Event("input"));
};

//Animation Loop
const animate = () => {
  setTimeout(animate, 1000 / 60);  // Approx 60 FPS
  canvas.draw(drawParams);
};

export { init, drawParams };
