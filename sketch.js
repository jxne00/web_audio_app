let audioFile;

// playback controls
let pauseButton, playButton, stopButton;
let skipStartButton, skipEndButton;
let loopButton;
let recordButton;

// low-pass filter
let filterSelection;
let lp_filter;
let lp_cutoff_knob, lp_resonance_knob;
let lp_drywet_slider, lp_output_slider;
let filterDelay;

// dynamic compressor
let dynamicCompressor;
let dc_attack_knob, dc_knee_knob, dc_release_knob, dc_ratio_knob, dc_threshold_knob;
let dc_drywet_slider, dc_output_slider;

// master volume
let masterVol;
let masterVol_slider;

// reverb
let reverb;
let rv_duration_knob, rv_decay_knob;
let rv_drywet_slider;
let rv_output_slider;
let rv_reverseButton;
let reverbReversed = false;

// waveshaper distortion
let waveshaperDistort;
let wd_amount_knob, wd_oversample_knob;
let wd_drywet_slider, wd_outputSlider;
let oversample = ['none', '2x', '4x', '8x'];

// spectrums
let fftIn, fftOut;

// mic & recorder
let mic, recorder, recordedFile;
let isRecording = false;

let playtime_slider;

function preload() {
  soundFormats('mp3', 'wav');
  audioFile = loadSound('/assets/contortyourself.mp3');
}

function setup() {
  createCanvas(750, 800);
  background(255);

  setupGUI();
  setupAudioChain();
}

function draw() {
  // set button colors based on active/not active
  setButtonStyle(playButton, audioFile.isPlaying(), '#008000');
  setButtonStyle(loopButton, audioFile.isLooping(), '#8000ff');
  setButtonStyle(pauseButton, audioFile.isPaused(), '#ff8000');

  // update playtime slider
  playtime_slider.changed(() => audioFile.jump(playtime_slider.value()));
  playtime_slider.value(audioFile.currentTime());

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

  // ========== FILTER SELECTION ========== //
  filterSelection = createSelect();
  filterSelection.position(10, 75);
  filterSelection.option('lowpass');
  filterSelection.option('highpass');
  filterSelection.option('bandpass');
  filterSelection.selected('lowpass');
  filterSelection.changed(() => lp_filter.setType(filterSelection.value()));

  //  ========= FILTER CONTROLS ========= //
  drawBox(15, 90, 190, 300, 'Filter');

  lp_cutoff_knob = new Knob(60, 180, 25, 20, 20000, 20, 'cutoff\nfrequency');
  lp_resonance_knob = new Knob(150, 180, 25, 0, 20, 10, 'resonance');
  lp_drywet_slider = drawSlider(0, 300, 120, 0, 1, 0.5, 0.01, 'dry/wet');
  lp_output_slider = drawSlider(90, 300, 120, 0, 1, 0.5, 0.01, 'output\nlevel');

  // ========== DYNAMIC COMPRESSOR CONTROLS ========== //
  drawBox(230, 90, 250, 400, 'dynamic compressor');

  dc_attack_knob = new Knob(270, 180, 25, 0, 1, 0.003, 'attack');
  dc_knee_knob = new Knob(350, 180, 25, 0, 40, 30, 'knee');
  dc_release_knob = new Knob(430, 180, 25, 0.01, 1, 0.25, 'release');
  dc_ratio_knob = new Knob(310, 260, 25, 1, 20, 12, 'ratio');
  dc_threshold_knob = new Knob(390, 260, 25, -100, 0, -24, 'threshold');

  dc_drywet_slider = drawSlider(250, 390, 120, 0, 1, 0.5, 0.01, 'dry/wet');
  dc_output_slider = drawSlider(330, 390, 120, 0, 1, 0.5, 0.01, 'output\nlevel');

  // ============= MASTER VOLUME ============= //
  drawBox(500, 90, 150, 200, 'master\nvolume');

  masterVol_slider = drawSlider(510, 200, 120, 0, 1, 0.5, 0.1, ' ');

  // ================ REVERB CONTROLS ================ //
  drawBox(15, 410, 190, 370, 'reverb');

  rv_duration_knob = new Knob(60, 500, 25, 0, 10, 3, 'duration');
  rv_decay_knob = new Knob(150, 500, 25, 0, 100, 2, 'decay');

  rv_reverseButton = setupButton('reverse', 30, 550, toggleReverse);

  rv_drywet_slider = drawSlider(10, 690, 100, 0, 1, 0.5, 0.01, 'dry/wet');
  rv_output_slider = drawSlider(100, 690, 100, 0, 1, 0.5, 0.01, 'output\nlevel');

  // ======== WAVESHAPER DISTORTION CONTROLS ======== //
  drawBox(230, 500, 220, 280, 'waveshaper distortion');

  wd_amount_knob = new Knob(300, 590, 25, 0, 1, 0, 'distortion\namount');
  wd_oversample_knob = new Knob(390, 590, 25, 0, 3, 0, 'oversample');
  wd_drywet_slider = drawSlider(250, 710, 100, 0, 1, 0.5, 0.01, 'dry/wet');
  wd_outputSlider = drawSlider(340, 710, 100, 0, 1, 0.5, 0.01, 'output\nlevel');

  // ================ SPECTRUMS ================ //
  drawBox(470, 500, 250, 140, 'spectrum in');
  drawBox(470, 640, 250, 140, 'spectrum out');

  // ================ PLAYTIME ================ //
  playtime_slider = createSlider(0, audioFile.duration(), 0, 0.1);
  playtime_slider.position(20, 790);
  playtime_slider.style('width', '700px');
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
function setupAudioChain() {
  // initialize audio effects
  lp_filter = new p5.Filter('lowpass');
  waveshaperDistort = new p5.Distortion();
  dynamicCompressor = new p5.Compressor();
  reverb = new p5.Reverb();
  masterVol = new p5.Gain();
  filterDelay = new p5.Delay();

  // initialize spectrums
  fftIn = new p5.FFT();
  fftOut = new p5.FFT();

  // initialize mic and recorder
  mic = new p5.AudioIn();
  recorder = new p5.SoundRecorder();
  recordedFile = new p5.SoundFile();

  // create audio chain:
  //  audio -> lowpass -> distortion -> compressor -> reverb -> master volume
  audioFile.disconnect();
  fftIn.setInput(audioFile);

  lp_filter.disconnect();
  waveshaperDistort.disconnect();
  // // filterDelay.disconnect();
  dynamicCompressor.disconnect();
  reverb.disconnect();
  masterVol.disconnect();

  lp_filter.chain(waveshaperDistort, dynamicCompressor, reverb);
  audioFile.connect(lp_filter);
  lp_filter.connect(masterVol);
  fftOut.setInput(masterVol);

  masterVol.connect();
}

/** function to set parameters for each effect */
function setEffectParams() {
  // filter (lowpass, highpass, bandpass)
  lp_filter.setType(filterSelection.value());
  lp_filter.set(lp_cutoff_knob.getValue(), lp_resonance_knob.getValue());
  lp_filter.drywet(lp_drywet_slider.value());
  lp_filter.amp(lp_output_slider.value());

  // waveshaper distortion
  waveshaperDistort.set(
    wd_amount_knob.getValue(),
    oversample[wd_oversample_knob.getValue()]
  );
  waveshaperDistort.drywet(wd_drywet_slider.value());
  waveshaperDistort.amp(wd_outputSlider.value());

  // dynamic compressor
  dynamicCompressor.set(
    dc_attack_knob.getValue(),
    dc_knee_knob.getValue(),
    dc_ratio_knob.getValue(),
    dc_threshold_knob.getValue(),
    dc_release_knob.getValue()
  );
  dynamicCompressor.drywet(dc_drywet_slider.value());
  dynamicCompressor.amp(dc_output_slider.value());

  // reverb
  // reverb.set(rv_duration_knob.getValue(), rv_decay_knob.getValue(), reverbReversed);
  reverb.drywet(rv_drywet_slider.value());
  reverb.amp(rv_output_slider.value());

  // master volume
  masterVol.amp(masterVol_slider.value());
}

function drawSpectrums() {
  // re-draw spectrums
  drawBox(470, 500, 250, 140, 'spectrum in');
  drawBox(470, 640, 250, 140, 'spectrum out');

  let spectrumIn = fftIn.analyze();

  // dimensions of rectangle box
  let boxWidth = 250,
    boxHeight = 140,
    boxPosX = 470;

  // spectrum in
  push();
  translate(boxPosX, 500);
  fill(12, 144, 177);
  noStroke();
  for (let i = 0; i < spectrumIn.length; i++) {
    let x = map(i, 0, spectrumIn.length, 0, boxWidth);
    let h = map(spectrumIn[i], 0, 255, 0, boxHeight);
    rect(x, boxHeight - h, boxWidth / spectrumIn.length, h);
  }
  pop();

  let spectrumOut = fftOut.analyze();

  // spectrum out
  push();
  translate(boxPosX, 640);
  fill(139, 12, 177);
  noStroke();
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

/** skip to (3 seconds before) end of audio */
function toAudioEnd() {
  if (audioFile.isPlaying()) {
    audioFile.jump(audioFile.duration() - 3);
  }
}

function recordSound() {
  if (!isRecording) {
    // mic.start();
    recorder.setInput(masterVol);
    recorder.record(recordedFile);
    recordButton.style('background-color', '#cc1b1b');
    recordButton.html('stop');
    isRecording = true;
  } else {
    // mic.stop();
    recorder.stop();
    save(recordedFile, 'recording.wav');
    recordButton.style('background-color', '#ffffff');
    recordButton.html('record');
    isRecording = false;
  }
}

function toggleReverse() {
  let paused = false;

  if (audioFile.isPlaying()) {
    audioFile.pause();
    paused = true;
  }

  audioFile.reverseBuffer();
  reverbReversed = !reverbReversed;
  reverb.set(rv_duration_knob.getValue(), rv_decay_knob.getValue(), reverbReversed);

  if (paused) {
    audioFile.play();
  }

  reverbReversed
    ? rv_reverseButton.style('background-color', '#ffffff')
    : rv_reverseButton.style('background-color', '#b3b3b3');
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
