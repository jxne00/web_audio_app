let audioFile;

// playback controls
let pauseButton, playButton, stopButton;
let skipStartButton, skipEndButton;
let loopButton;
let recordButton;

// low-pass filter
let lp_filter;
let lp_cutoff_knob, lp_resonance_knob;
let lp_dryWetSlider, lp_outputSlider;

// dynamic compressor
let dynamicCompressor;
let dc_attack_knob, dc_knee_knob, dc_release_knob, dc_ratio_knob, dc_threshold_knob;
let dc_dryWetSlider, dc_outputSlider;

// master volume
let mv_volumeSlider;

// reverb
let reverb;
let rv_duration_knob, rv_decay_knob;
let rv_dryWetSlider;
let rv_outputSlider;
let rv_reverseButton;
let reverbReversed = false;

// waveshaper distortion
let waveshaperDistort;
let wd_amount_knob, wd_oversample_knob;
let wd_dryWetSlider, wd_outputSlider;

// spectrum
let fftIn, fftOut;

// mic & recorder
let mic;
let recorder;
let recordedFile;
let isRecording = false;

function preload() {
  audioFile = loadSound('/assets/animal_crossing_lofi.mp3');
}

function setup() {
  createCanvas(750, 800);
  background(255);

  setupGUI();
  setupEffects();
}

function draw() {
  // set button colors based on active/not active
  setButtonStyle(playButton, audioFile.isPlaying(), '#008000');
  setButtonStyle(loopButton, audioFile.isLooping(), '#8000ff');
  setButtonStyle(pauseButton, audioFile.isPaused(), '#ff8000');
  setButtonStyle(recordButton, isRecording, '#cc1b1b');
  setButtonStyle(rv_reverseButton, reverbReversed, '#008000');

  drawKnobs();
  setEffectParams();
  drawSpectrums();
}

// setup the buttons and sliders
function setupGUI() {
  // ========== PLAYBACK CONTROL BUTTONS ========== //
  let posX = 20,
    posY = 20;

  pauseButton = setupButton('pause', posX, posY, pauseAudio);
  playButton = setupButton('play', (posX += 70), posY, playAudio);
  stopButton = setupButton('stop', (posX += 70), posY, stopAudio);
  skipStartButton = setupButton('skip to start', (posX += 70), posY, restartAudio);
  skipEndButton = setupButton('skip to end', (posX += 70), posY, toAudioEnd);
  loopButton = setupButton('loop', (posX += 70), posY, loopAudio);
  recordButton = setupButton('record', (posX += 70), posY, recordSound);

  //  ========= LOW-PASS FILTER CONTROLS ========= //
  drawBox(15, 90, 190, 300, 'low-pass filter');

  lp_cutoff_knob = new Knob(60, 180, 25, 20, 20000, 20, 'cutoff\nfrequency');
  lp_resonance_knob = new Knob(150, 180, 25, 0, 20, 10, 'resonance');
  lp_dryWetSlider = drawSlider(0, 300, 120, 0, 1, 0.5, 0.01, 'dry/wet');
  lp_outputSlider = drawSlider(90, 300, 120, 0, 1, 0.5, 0.01, 'output\nlevel');

  // ========== DYNAMIC COMPRESSOR CONTROLS ========== //
  drawBox(230, 90, 250, 400, 'dynamic compressor');

  dc_attack_knob = new Knob(270, 180, 25, 0, 1, 0.003, 'attack');
  dc_knee_knob = new Knob(350, 180, 25, 0, 40, 30, 'knee');
  dc_release_knob = new Knob(430, 180, 25, 0.01, 1, 0.25, 'release');
  dc_ratio_knob = new Knob(310, 260, 25, 1, 20, 12, 'ratio');
  dc_threshold_knob = new Knob(390, 260, 25, -100, 0, -24, 'threshold');

  dc_dryWetSlider = drawSlider(250, 390, 120, 0, 1, 0.5, 0.01, 'dry/wet');
  dc_outputSlider = drawSlider(330, 390, 120, 0, 1, 0.5, 0.01, 'output\nlevel');

  // ============= MASTER VOLUME ============= //
  drawBox(500, 90, 150, 200, 'master\nvolume');

  mv_volumeSlider = drawSlider(510, 200, 120, 0, 1, 0.5, 0.1, ' ');

  // ================ REVERB CONTROLS ================ //
  drawBox(15, 410, 190, 370, 'reverb');

  rv_duration_knob = new Knob(60, 500, 25, 0, 10, 3, 'duration');
  rv_decay_knob = new Knob(150, 500, 25, 0, 10, 2, 'decay');

  rv_reverseButton = setupButton('reverse', 30, 550, reverbReverse);

  rv_dryWetSlider = drawSlider(10, 690, 100, 0, 1, 0.5, 0.01, 'dry/wet');
  rv_outputSlider = drawSlider(100, 690, 100, 0, 1, 0.5, 0.01, 'output\nlevel');

  // ======== WAVESHAPER DISTORTION CONTROLS ======== //
  drawBox(230, 500, 220, 280, 'waveshaper distortion');

  wd_amount_knob = new Knob(300, 590, 25, 0, 1, 0, 'distortion\namount');
  wd_oversample_knob = new Knob(390, 590, 25, 0, 3, 0, 'oversample');
  wd_dryWetSlider = drawSlider(250, 710, 100, 0, 1, 0, 0.01, 'dry/wet');
  wd_outputSlider = drawSlider(340, 710, 100, 0, 1, 0, 0.01, 'output\nlevel');

  // ================ SPECTRUMS ================ //
  drawBox(470, 500, 250, 140, 'spectrum in');
  drawBox(470, 640, 250, 140, 'spectrum out');
}

/** function to setup a button */
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

/** function to set different colors to active buttons */
function setButtonStyle(button, isActive, activeCol) {
  isActive
    ? button.style('background-color', activeCol)
    : button.style('background-color', '#ffffff');
}

/** function to draw rectangle box with header text */
function drawBox(posX, posY, width, height, header) {
  rect(posX, posY, width, height);

  push();
  fill(0);
  textFont('Verdana');
  textSize(16);
  header.includes('spectrum') ? textAlign(LEFT, TOP) : textAlign(CENTER, TOP);
  text(header, posX + width / 2, posY + 8);
  pop();
}

/** function to draw all knobs */
function drawKnobs() {
  lp_cutoff_knob.draw();
  lp_resonance_knob.draw();
  dc_attack_knob.draw();
  dc_knee_knob.draw();
  dc_release_knob.draw();
  dc_ratio_knob.draw();
  dc_threshold_knob.draw();
  rv_duration_knob.draw();
  rv_decay_knob.draw();
  wd_amount_knob.draw();
  wd_oversample_knob.draw();
}

/** function to draw vertical slider with label */
function drawSlider(posX, posY, width, minVal, maxVal, value, step, label) {
  let slider = createSlider(minVal, maxVal, value, step);
  slider.position(posX, posY);
  slider.style('transform', 'rotate(-90deg)');

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

  return slider;
}

/** function to initialise audio effects and connect audio chain  */
function setupEffects() {
  // initialize audio effects
  lp_filter = new p5.LowPass();
  waveshaperDistort = new p5.Distortion();
  dynamicCompressor = new p5.Compressor();
  reverb = new p5.Reverb();

  // initialize spectrums
  fftIn = new p5.FFT();
  fftOut = new p5.FFT();

  // initialize mic and recorder
  mic = new p5.AudioIn();
  recorder = new p5.SoundRecorder();
  recordedFile = new p5.SoundFile();

  audioFile.disconnect();
  fftIn.setInput(audioFile);

  // create audio chain:
  //  audio -> lowpass -> distortion -> compressor -> reverb -> master volume
  let audioChain = lp_filter.chain(waveshaperDistort, dynamicCompressor, reverb);
  audioFile.connect(audioChain);
  fftOut.setInput(audioChain);
  recorder.setInput(mic);
}

/** function to set parameters for each effect */
function setEffectParams() {
  // low-pass filter
  lp_filter.freq(lp_cutoff_knob.getValue());
  lp_filter.res(lp_resonance_knob.getValue());
  lp_filter.drywet(lp_dryWetSlider.value());
  lp_filter.amp(lp_outputSlider.value());

  // dynamic compressor
  dynamicCompressor.set(
    dc_attack_knob.getValue(),
    dc_knee_knob.getValue(),
    dc_ratio_knob.getValue(),
    dc_threshold_knob.getValue(),
    dc_release_knob.getValue()
  );
  dynamicCompressor.drywet(dc_dryWetSlider.value());
  dynamicCompressor.amp(dc_outputSlider.value());

  // reverb
  reverb.set(rv_duration_knob.getValue(), rv_decay_knob.getValue(), reverbReversed);
  reverb.drywet(rv_dryWetSlider.value());
  reverb.amp(rv_outputSlider.value());

  // waveshaper distortion
  let oversample = ['none', '2x', '4x', '8x'];
  waveshaperDistort.set(
    wd_amount_knob.getValue(),
    oversample[wd_oversample_knob.getValue()]
  );
  waveshaperDistort.drywet(wd_dryWetSlider.value());
  waveshaperDistort.amp(wd_outputSlider.value());

  // master volume
  audioFile.setVolume(mv_volumeSlider.value());
}

function drawSpectrums() {
  let spectrumIn = fftIn.analyze();
  let spectrumOut = fftOut.analyze();

  // dimensions of rectangle box
  let boxWidth = 250,
    boxHeight = 140,
    boxPosX = 470;

  // spectrum in
  push();
  translate(boxPosX, 500);
  fill(153, 24, 155);
  noStroke();
  for (let i = 0; i < spectrumIn.length; i++) {
    let x = map(i, 0, spectrumIn.length, 0, boxWidth);
    let h = map(spectrumIn[i], 0, 255, 0, boxHeight);
    rect(x, boxHeight - h, boxWidth / spectrumIn.length, h);
  }
  pop();

  // spectrum out
  push();
  translate(boxPosX, 640);
  fill(12, 144, 177);
  for (let i = 0; i < spectrumOut.length; i++) {
    let x = map(i, 0, spectrumOut.length, 0, boxWidth);
    let h = map(spectrumOut[i], 0, 255, 0, boxHeight);
    rect(x, boxHeight - h, boxWidth / spectrumOut.length, h);
  }
  pop();
}

function playAudio() {
  if (!audioFile.isPlaying()) audioFile.play();
}

function pauseAudio() {
  if (audioFile.isPlaying()) audioFile.pause();
}

function stopAudio() {
  if (audioFile.isPlaying()) audioFile.stop();
}

/** toggle loop on and off */
function loopAudio() {
  if (audioFile.isPlaying()) {
    audioFile.isLooping() ? audioFile.setLoop(false) : audioFile.setLoop(true);
  }
}

/** skip to start of audio */
function restartAudio() {
  if (audioFile.isPlaying()) {
    audioFile.jump(0);
  }
}

/** skip to end of audio */
function toAudioEnd() {
  if (audioFile.isPlaying()) {
    audioFile.jump(audioFile.duration() - 3);
  }
}

// TODO record mic input and save as wav file
function recordSound() {
  if (!isRecording && !audioFile.isPlaying()) {
    recorder.record(recordedFile);
    isRecording = true;
  } else {
    recorder.stop();
    recordedFile.save('recorded.wav');
    isRecording = false;
  }
}

function reverbReverse() {
  reverbReversed = !reverbReversed;

  if (reverbReversed) {
    rv_reverseButton.style('background-color', '#008000');
  } else {
    rv_reverseButton.style('background-color', '#ffffff');
  }
}

function mousePressed() {
  // update knob angle when pressed
  lp_cutoff_knob.mousePressed();
  lp_resonance_knob.mousePressed();
  dc_attack_knob.mousePressed();
  dc_knee_knob.mousePressed();
  dc_release_knob.mousePressed();
  dc_ratio_knob.mousePressed();
  dc_threshold_knob.mousePressed();
  rv_duration_knob.mousePressed();
  rv_decay_knob.mousePressed();
  wd_amount_knob.mousePressed();
  wd_oversample_knob.mousePressed();
}

function mouseReleased() {
  // stop dragging knob when released
  lp_cutoff_knob.mouseReleased();
  lp_resonance_knob.mouseReleased();
  dc_attack_knob.mouseReleased();
  dc_knee_knob.mouseReleased();
  dc_release_knob.mouseReleased();
  dc_ratio_knob.mouseReleased();
  dc_threshold_knob.mouseReleased();
  rv_duration_knob.mouseReleased();
  rv_decay_knob.mouseReleased();
  wd_amount_knob.mouseReleased();
  wd_oversample_knob.mouseReleased();
}
