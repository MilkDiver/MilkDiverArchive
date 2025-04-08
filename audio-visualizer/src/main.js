/*
	main.js is primarily responsible for hooking up the UI to the rest of the application 
	and setting up the main event loop
*/

// We will write the functions in this file in the traditional ES5 way
// In this instance, we feel the code is more readable if written this way
// If you want to re-write these as ES6 arrow functions, to be consistent with the other files, go ahead!

import * as utils from './utils.js';
import * as audio from './audio.js';
import * as canvas from './visualizer.js';

const drawParams = {
  showWaveform : false,
  showGradient : false,
  showBars     : false,
  showCircles  : false,
  showNoise    : false,
  showInvert   : false,
  showEmboss   : false
};

// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
	sound1  :  "media/New Adventure Theme.mp3"
});

const init = () =>{

  //Set up variables
  audio.setupWebAudio(DEFAULTS.sound1);

  //Quick Test
	console.log("init called");


	let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
	setupUI(canvasElement);
  canvas.setupCanvas(canvasElement, audio.analyserNode);
  loop();
}

const setupUI = (canvasElement) => {
  // A - hookup fullscreen button
  const fsButton = document.querySelector("#btn-fs");
	
  // add .onclick event to button
  fsButton.onclick = e => {
    console.log("goFullscreen() called");
    utils.goFullscreen(canvasElement);
  };

  // B - Play Button
  const playButton = document.querySelector("#btn-play");

  // add .onclick event to button
  playButton.onclick = e => {
    console.log(`audioCt.state before = ${audio.audioCtx.state}`);
    

    //check if content is in suspended state (autoplay policy)
    if (audio.audioCtx.state === "suspended") {
      audio.audioCtx.resume();
      console.log("AudioContext resumed");
    }
    console.log(`audioCtx.state after = ${audio.audioCtx.state}`);
    if (e.target.dataset.playing === "no"){
      // if track is paused, play it
      audio.playCurrentSound();
      e.target.dataset.playing = "yes";
    } else {
      //if track is playing, pause it.
      audio.pauseCurrentSound();
      e.target.dataset.playing = "no";
    }
  };

  // C - hookup volume slider & label
  let volumeSlider = document.querySelector("#slider-volume");
  let volumeLabel = document.querySelector("#volumeLabel");

  // add .oninput event to slider
  volumeSlider.oninput = e => {
    //set the gain
    audio.setVolume(e.target.value);
    //update label to match value of slider
    volumeLabel.innerHTML = Math.round((e.target.value/2 * 100));
  };

  //set value of label to match initial value of slider
  volumeSlider.dispatchEvent(new Event("input"));

  // D - hookup track <select>
  let trackSelect = document.querySelector("#trackSelect");
  // add .onchange event to <select>
  trackSelect.onchange = e => {
    audio.loadSoundFile(e.target.value);
    // pause the current track if it is playing
    if (playButton.dataset.playing === "yes"){
      playButton.dispatchEvent(new MouseEvent("click"));
    }
  };

  let waveformCB = document.querySelector("#cb-waveform");
  let gradientCB = document.querySelector("#cb-gradient");
  let barsCB = document.querySelector("#cb-bars");
  let circlesCB = document.querySelector("#cb-circles");
  let noiseCB = document.querySelector("#cb-noise");
  let invertCB = document.querySelector("#cb-invert");
  let embossCB = document.querySelector("#cb-emboss");


  waveformCB.onchange = e => {
    drawParams.showWaveform = waveformCB.checked;
  }
  gradientCB.onchange = e => {
    drawParams.showGradient = gradientCB.checked;
  };
  barsCB.onchange = e => {
    drawParams.showBars = barsCB.checked;
  };
  circlesCB.onchange = e => {
    drawParams.showCircles = circlesCB.checked;
  };
  noiseCB.onchange = e => {
    drawParams.showNoise = noiseCB.checked;
  };
  invertCB.onchange = e => {
    drawParams.showInvert = invertCB.checked;
  };
  embossCB.onchange = e => {
    drawParams.showEmboss = embossCB.checked;
  };
  

  //Bass and Treble Bits
  let highshelf = false;
  let lowshelf = false;
  const toggleHighshelf = () =>{
    if(highshelf){
      audio.biquadFilterNode.frequency.setValueAtTime(1000, audio.audioCtx.currentTime); // we created the `biquadFilter` (i.e. "treble") node last time
      audio.biquadFilterNode.gain.setValueAtTime(10, audio.audioCtx.currentTime);
    }else{
      audio.biquadFilterNode.gain.setValueAtTime(0, audio.audioCtx.currentTime);
    }
  }

  const toggleLowshelf = () =>{
    if(lowshelf){
      audio.lowShelfBiquadFilterNode.frequency.setValueAtTime(1000, audio.audioCtx.currentTime);
      audio.lowShelfBiquadFilterNode.gain.setValueAtTime(10, audio.audioCtx.currentTime);
    }else{
      audio.lowShelfBiquadFilterNode.gain.setValueAtTime(0, audio.audioCtx.currentTime);
    }
  }
  
  // I. set the initial state of the high shelf checkbox
  document.querySelector('#cb-highshelf').checked = highshelf; // `highshelf` is a boolean we will declare in a second
  
  // II. change the value of `highshelf` every time the high shelf checkbox changes state
  document.querySelector('#cb-highshelf').onchange = e => {
    highshelf = e.target.checked;
    toggleHighshelf(); // turn on or turn off the filter, depending on the value of `highshelf`!
  };
  
  // III. 
  toggleHighshelf(); // when the app starts up, turn on or turn off the filter, depending on the value of `highshelf`!

  // I. set the initial state of the high shelf checkbox
  document.querySelector('#cb-lowshelf').checked = lowshelf; // `lowshelf` is a boolean we will declare in a second
  
  // II. change the value of `lowshelf` every time the low shelf checkbox changes state
  document.querySelector('#cb-lowshelf').onchange = e => {
    lowshelf = e.target.checked;
    toggleLowshelf(); // turn on or turn off the filter, depending on the value of `lowshelf`!
  };
  
  // III. 
  toggleLowshelf(); // when the app starts up, turn on or turn off the filter, depending on the value of `lowshelf`!


  //Distortion Yippee
  let distortionSlider = document.querySelector("#slider-distortion");
  let distortionLabel = document.querySelector("#distortionLabel");
  let distortionAmount = 0;


    // from: https://developer.mozilla.org/en-US/docs/Web/API/WaveShaperNode
    const makeDistortionCurve = (amount=20) => {
      let n_samples = 256, curve = new Float32Array(n_samples);
      for (let i =0 ; i < n_samples; ++i ) {
        let x = i * 2 / n_samples - 1;
        curve[i] = (Math.PI + amount) * x / (Math.PI + amount * Math.abs(x));
      }
      return curve;
    }  
  
    const toggleDistortion = () => {
      if (distortionAmount > 0) {
          console.log("Applying distortion with amount:", distortionAmount);
          audio.distortionFilterNode.curve = null; // being paranoid and trying to trigger garbage collection
          audio.distortionFilterNode.curve = makeDistortionCurve(distortionAmount);
      } else {
          console.log("Applying neutral curve (no distortion)");
          audio.distortionFilterNode.curve = new Float32Array([0, 0, 0]); // Neutral curve
      }
      console.log("Distortion curve applied:", audio.distortionFilterNode.curve);
  };


  distortionSlider.value = distortionAmount;
  //set value of label to match initial value of slider
  distortionSlider.oninput = e => {
  distortionAmount = Number(e.target.value) * 20 - .1999;
  distortionLabel.innerHTML = Math.round((e.target.value/2 * 100));
  toggleDistortion();
  console.log("Distortion Amount:", distortionAmount);

  }; 
  distortionSlider.dispatchEvent(new Event("input"));
} // end setupUI

const loop = () => {
  /* NOTE: This is temporary testing code that we will delete in Part II */
    requestAnimationFrame(loop);
    canvas.draw(drawParams);
}

export {init}