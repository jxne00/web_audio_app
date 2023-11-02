var audioFile;

// playback controls
var pauseButton;
var playButton;
var stopButton;
var skipStartButton;
var skipEndButton;
var loopButton;
var recordButton;

// low-pass filter
var lp_filter;
var lp_cutOffSlider;
var lp_resonanceSlider;
var lp_dryWetSlider;
var lp_outputSlider;

var lp_cutoff_knob;
var lp_resonance_knob;

// dynamic compressor
var dynamicCompressor;
var dc_attackSlider;
var dc_kneeSlider;
var dc_releaseSlider;
var dc_ratioSlider;
var dc_thresholdSlider;
var dc_dryWetSlider;
var dc_outputSlider;

// master volume
var masterVol;
var mv_volumeSlider;

// reverb
var reverb;
var rv_durationSlider;
var rv_decaySlider;
var rv_dryWetSlider;
var rv_outputSlider;
var rv_reverseButton;

// waveshaper distortion
var waveshaperDistort;
var wd_amountSlider;
var wd_oversampleSlider;
var wd_dryWetSlider;
var wd_outputSlider;

// spectrum
var fftIn;
var fftOut;

function preload() {
  soundFormats('mp3', 'wav');
  audioFile = loadSound('assets/animal_crossing_lofi.mp3');
}

function setup() {
  createCanvas(750, 800);
  // background('#8eb8d0');
  background(255);

  setupGUI();

  //   fftIn = new p5.FFT();
  //   fftOut = new p5.FFT();

  setupAudioChain();

  //   fftIn.setInput(audioFile);
  //   fftOut.setInput(masterVol);
}

function draw() {
  // audioFile.setVolume(mv_volumeSlider.value());

  // drawEffects();

  // set button colors based on active/not active
  setButtonStyle(playButton, audioFile.isPlaying(), '#008000');
  setButtonStyle(loopButton, audioFile.isLooping(), '#8000ff');
  setButtonStyle(pauseButton, audioFile.isPaused(), '#ff8000');
}

// setup the buttons and sliders
function setupGUI() {
  // ========== PLAYBACK CONTROL BUTTONS ========== //
  var posX = 20;
  var posY = 20;

  pauseButton = setupButton('pause', posX, posY, pauseAudio);
  playButton = setupButton('play', (posX += 70), posY, playAudio);
  stopButton = setupButton('stop', (posX += 70), posY, stopAudio);
  skipStartButton = setupButton(
    'skip to start',
    (posX += 70),
    posY,
    restartAudio
  );
  skipEndButton = setupButton('skip to end', (posX += 70), posY, toAudioEnd);
  loopButton = setupButton('loop', (posX += 70), posY, loopAudio);
  recordButton = setupButton('record', (posX += 70), posY, recordSound);

  //  ========= LOW-PASS FILTER CONTROLS ========= //
  drawBox(15, 90, 190, 300, 'low-pass filter');

  lp_cutOffSlider = drawKnob(
    60,
    180,
    50,
    20,
    20000,
    10000,
    'cutoff\nfrequency'
  );
  lp_resonanceSlider = drawKnob(150, 180, 50, 0, 20, 3, 'resonance');

  lp_dryWetSlider = drawSlider(0, 300, 120, 0, 1, 0.5, 'dry/wet');
  lp_outputSlider = drawSlider(90, 300, 120, 0, 1, 0.5, 'output\nlevel');

  // ========== DYNAMIC COMPRESSOR CONTROLS ========== //
  drawBox(230, 90, 250, 400, 'dynamic compressor');

  dc_attackSlider = drawKnob(270, 180, 50, 0, 1, 0.3, 'attack');
  dc_kneeSlider = drawKnob(350, 180, 50, 0, 40, 30, 'knee');
  dc_releaseSlider = drawKnob(430, 180, 50, 0, 1, 0.3, 'release');
  dc_ratioSlider = drawKnob(310, 260, 50, 1, 20, 12, 'ratio');
  dc_thresholdSlider = drawKnob(390, 260, 50, -100, 0, -24, 'threshold');

  dc_dryWetSlider = drawSlider(250, 390, 120, 0, 1, 1, 'dry/wet');
  dc_outputSlider = drawSlider(330, 390, 120, 0, 1, 0.5, 'output\nlevel');

  // ============= MASTER VOLUME ============= //
  drawBox(500, 90, 150, 200, 'master\nvolume');
  mv_volumeSlider = drawSlider(510, 200, 120, 0, 1, 0.5, '');

  // ================ REVERB CONTROLS ================ //
  drawBox(15, 410, 190, 370, 'reverb');

  rv_durationSlider = drawKnob(60, 500, 50, 0.1, 10, 3, 'duration');
  rv_decaySlider = drawKnob(150, 500, 50, 0, 5, 2, 'decay');

  rv_reverseButton = setupButton('reverse', 30, 550, function () {
    // TODO reverse reverb
    if (reverb._reverse) {
      reverb._reverse = false;
    } else {
      reverb._reverse = true;
    }
  });

  rv_dryWetSlider = drawSlider(10, 690, 100, 0, 1, 0.5, 'dry/wet');
  rv_outputSlider = drawSlider(100, 690, 100, 0, 1, 0.5, 'output\nlevel');

  // ======== WAVESHAPER DISTORTION CONTROLS ======== //
  drawBox(230, 500, 220, 280, 'waveshaper distortion');

  wd_amountSlider = drawKnob(300, 590, 50, 0, 1, 0.5, 'distortion\namount');
  wd_oversampleSlider = drawKnob(390, 590, 50, 0, 1, 0.5, 'oversample');

  wd_dryWetSlider = drawSlider(250, 700, 100, 0, 1, 0.5, 'dry/wet');
  wd_outputSlider = drawSlider(340, 700, 100, 0, 1, 0.5, 'output\nlevel');

  // ================ SPECTRUMS ================ //
  drawBox(470, 500, 250, 280, 'spectrum in/out');
}

// function to setup a button
function setupButton(name, posX, posY, onPress) {
  var button = createButton(name);

  button.size(60, 50);
  button.style('background-color', '#ffffff');
  button.style('border-width', '1px');
  button.style('color', '#000000');
  button.style('font-size', '14px');
  button.style('font-family', 'courier-new');
  button.style('padding', '0px 12px 0px 12px');
  button.style('cursor', 'pointer');

  button.position(posX, posY);
  button.mousePressed(onPress);

  return button;
}

// function to set different colors to active buttons
function setButtonStyle(button, isActive, activeCol) {
  if (activeCol === undefined) activeCol = '#ff0000';

  isActive
    ? button.style('background-color', activeCol)
    : button.style('background-color', '#ffffff');
}

// function to draw rectangle box with header text
function drawBox(posX, posY, width, height, header) {
  rect(posX, posY, width, height);

  // draw header text on top center of rect
  push();
  fill(0);
  textFont('Verdana');
  textSize(16);
  textAlign(CENTER, TOP);
  text(header, posX + width / 2, posY + 8);
  pop();
}

// function to draw a knob
function drawKnob(posX, posY, diameter, minVal, maxVal, value, label) {
  // TODO draw knob
  // https://editor.p5js.org/icm/sketches/HkfFHcp2
  // https://editor.p5js.org/emmajaneculhane/sketches/ozqo5lh4j

  // draw 'knob
  fill(255);
  circle(posX, posY, diameter);

  // knob label
  push();
  fill(0);
  textFont('Verdana');
  textSize(11);
  textLeading(13);
  textAlign(CENTER, BOTTOM);
  text(label, posX, posY - diameter / 2 - 5);
  pop();
}

function drawSlider(posX, posY, width, minVal, maxVal, value, label) {
  // TODO draw slider

  // rect(posX + width / 2 - 15, posY - width / 2, 30, width + 10);

  var slider = createSlider(minVal, maxVal, value, 0.01);
  slider.position(posX, posY);
  slider.style('transform', 'rotate(90deg)');

  slider.style('width', width + 'px');
  slider.addClass('mySliders');

  push();
  fill(0);
  textSize(11);
  textLeading(13);
  textFont('Verdana');
  textAlign(CENTER, BOTTOM);
  text(label, posX + width / 2, posY - width / 2 - 3);
  pop();
}

// play
function playAudio() {
  if (!audioFile.isPlaying()) {
    audioFile.play();
  }
}

// pause
function pauseAudio() {
  if (audioFile.isPlaying()) {
    audioFile.pause();
  }
}

// stop
function stopAudio() {
  if (audioFile.isPlaying()) {
    audioFile.stop();
  }
}

// loop
function loopAudio() {
  if (audioFile.isPlaying()) {
    if (audioFile.isLooping()) {
      audioFile.setLoop(false);
    } else {
      audioFile.setLoop(true);
    }
  }
}

// skip to start
function restartAudio() {
  if (audioFile.isPlaying()) {
    audioFile.jump(0);
  }
}

// skip to end
function toAudioEnd() {
  if (audioFile.isPlaying()) {
    audioFile.jump(audioFile.duration() - 3);
  }
}

function recordSound() {
  // TODO record mic input and save as wav file
}

function lowPassFilter() {
  // TODO low pass filter
}

function setupAudioChain() {
  // initialize audio elements
  lp_filter = new p5.LowPass();
  waveshaperDistort = new p5.Distortion();
  dynamicCompressor = new p5.Compressor();
  reverb = new p5.Reverb();
  masterVol = new p5.Gain();

  // chain (audioFile -> lowpass -> waveshaperDistort -> dynamicCompressor -> reverb -> masterVol -> output)
  audioFile.disconnect();
  audioFile.connect(lp_filter);
  lp_filter.chain(waveshaperDistort, dynamicCompressor, reverb, masterVol);
}

function drawEffects() {
  // low-pass filter
  lp_filter.freq(lp_cutOffSlider.value());
  lp_filter.res(lp_resonanceSlider.value());
  lp_filter.drywet(lp_dryWetSlider.value());
  lp_filter.amp(lp_outputSlider.value());

  // dynamic compressor
  dynamicCompressor.attack(dc_attackSlider.value());
  dynamicCompressor.knee(dc_kneeSlider.value());
  dynamicCompressor.release(dc_releaseSlider.value());
  dynamicCompressor.ratio(dc_ratioSlider.value());
  dynamicCompressor.threshold(dc_thresholdSlider.value());
  dynamicCompressor.drywet(dc_dryWetSlider.value());
  dynamicCompressor.amp(dc_outputSlider.value());

  // reverb
  //   reverb.set(rv_durationSlider.value() * 10, rv_decaySlider.value());
  reverb.drywet(rv_dryWetSlider.value());
  reverb.amp(rv_outputSlider.value());

  // waveshaper distortion
  waveshaperDistort.amount(wd_amountSlider.value());
  waveshaperDistort.oversample(wd_oversampleSlider.value());
  waveshaperDistort.drywet(wd_dryWetSlider.value());
  waveshaperDistort.amp(wd_outputSlider.value());

  // draw spectrums
  // var spectrumIn = fftIn.analyze();
  // var spectrumOut = fftOut.analyze();

  // noStroke();

  // spectrum in
  // fill(255, 0, 0);
  // for (let i = 0; i < spectrumIn.length; i++) {
  //   let x = map(i, 0, spectrumIn.length, 560, width);
  //   let h = -100 + map(spectrumIn[i], 0, 255, 100, 0);
  //   rect(x, 260, (width - 560) / spectrumIn.length, h);
  // }

  // spectrum out
  // fill(0, 0, 255);
  // for (let i = 0; i < spectrumOut.length; i++) {
  //   let x = map(i, 0, spectrumOut.length, 560, width);
  //   let h = -100 + map(spectrumOut[i], 0, 255, 100, 0);
  //   rect(x, 430, (width - 560) / spectrumOut.length, h);
  // }
}
