// audio.js
// Desc.: Creates audio nodes and connects them to the audio context.
// Written by: Jack Moyen
// Last Updated: March 2025
// Reformatted by AI. Obviously.

let audioCtx;
let element, sourceNode, analyserNode, gainNode, biquadFilterNode, lowShelfBiquadFilterNode, distortionFilterNode;

const DEFAULTS = Object.freeze({
  gain: 0.2,
  numSamples: 256
});

let audioData = new Uint8Array(DEFAULTS.numSamples / 2);

//Audio Setup
const setupWebAudio = (filePath) => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();

  element = new Audio();
  loadSoundFile(filePath);

  //Node Setup

  //Source Node
  sourceNode = audioCtx.createMediaElementSource(element);
  

  //Analyser Node
  analyserNode = audioCtx.createAnalyser();
  analyserNode.fftSize = DEFAULTS.numSamples;

  //Biquad Filter Nodes
  biquadFilterNode = audioCtx.createBiquadFilter();
  biquadFilterNode.type = "highshelf";
  lowShelfBiquadFilterNode = audioCtx.createBiquadFilter();
  lowShelfBiquadFilterNode.type = "lowshelf";

  //Distortion Filter Node
  distortionFilterNode = audioCtx.createWaveShaper();

  //Gain Node
  gainNode = audioCtx.createGain();
  gainNode.gain.value = DEFAULTS.gain;

  //Node Connections
  sourceNode.connect(analyserNode);
  analyserNode.connect(biquadFilterNode);
  biquadFilterNode.connect(lowShelfBiquadFilterNode);
  lowShelfBiquadFilterNode.connect(distortionFilterNode);
  distortionFilterNode.connect(gainNode);
  gainNode.connect(audioCtx.destination);
};

const loadSoundFile = (filePath) => {
  element.src = filePath;
};

const playCurrentSound = () => {
  element.play();
};

const pauseCurrentSound = () => {
  element.pause();
};

const setVolume = (value) => {
  gainNode.gain.value = Number(value);
};

export { 
  audioCtx, 
  setupWebAudio, 
  playCurrentSound, 
  pauseCurrentSound, 
  loadSoundFile, 
  setVolume, 
  analyserNode, 
  biquadFilterNode, 
  lowShelfBiquadFilterNode, 
  distortionFilterNode 
};
