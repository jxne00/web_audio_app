let audioFile;
let audioPath = 'assets/random.mp3';
let audioSource = 'audioFile'; // 'audioFile' or 'mic'

// playback control buttons
let pauseButton, playButton, stopButton;
let skipStartButton, skipEndButton;
let loopButton;
let recordButton;
let micButton;

// low-pass filter
let filterSelection;
let lp_filter;
let lp_cutoff_knob, lp_resonance_knob;
let lp_drywet_slider, lp_output_slider;

// delay
let delay;
let delay_time_knob, delay_feedback_knob;
let delay_drywet_slider, delay_output_slider;

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
// oversample parameter options
let oversample = ['none', '2x', '4x', '8x'];

// spectrums
let fftIn, fftOut;

// mic & recorder
let mic, recorder, recordedFile;
let isRecording = false;

let playtime_slider;
let knobs = [];

function preload() {
  soundFormats('mp3', 'wav');
  audioFile = loadSound(audioPath);
}

function setup() {
  createCanvas(750, 820);
  background(195, 202, 224);

  setupGUI();

  // initialize mic and recorder
  mic = new p5.AudioIn();
  recorder = new p5.SoundRecorder();
  recordedFile = new p5.SoundFile();

  setupAudioChain(audioFile);
}

function draw() {
  // set button colors based on active/not active
  setButtonStyle(playButton, audioFile.isPlaying(), '#7ecc7e');
  setButtonStyle(loopButton, audioFile.isLooping(), '#8bb3e0');
  setButtonStyle(pauseButton, audioFile.isPaused(), '#d1aa6f');

  drawPlaytime();

  // draw knobs
  knobs.forEach((knob) => knob.draw());

  setEffectParams();
  drawSpectrums();
}

function setupGUI() {
  // ========== PLAYBACK CONTROL BUTTONS ========== //
  let posX = 20,
    posY = 12,
    gap = 80;

  playButton = setupButton('Play', posX, posY, playAudio);
  pauseButton = setupButton('Pause', (posX += gap), posY, pauseAudio);
  stopButton = setupButton('Stop', (posX += gap), posY, stopAudio);
  skipStartButton = setupButton('Skip to start', (posX += gap), posY, restartAudio);
  skipEndButton = setupButton('Skip to end', (posX += gap), posY, toAudioEnd);
  loopButton = setupButton('Loop', (posX += gap), posY, loopAudio);
  recordButton = setupButton('Record', (posX += gap), posY, toggleRecord);
  micButton = setupButton('Mic', (posX += gap), posY, toggleMic);

  // ================ PLAYTIME ================ //
  playtime_slider = createSlider(0, audioFile.duration(), 0, 0.1);
  playtime_slider.position(12, 65);
  playtime_slider.addClass('playback');

  // ========== FILTER SELECTION ========== //
  filterSelection = createSelect();
  filterSelection.position(65, 135);
  filterSelection.addClass('filterDropdown');
  filterSelection.option('lowpass');
  filterSelection.option('highpass');
  filterSelection.option('bandpass');
  filterSelection.selected('lowpass');
  // update filter type when new option selected
  filterSelection.changed(() => lp_filter.setType(filterSelection.value()));

  //  ========= FILTER CONTROLS ========= //
  drawBox(15, 100, 190, 330, 'Filter');

  lp_cutoff_knob = new Knob(60, 230, 25, 20, 20000, 20, 'Cutoff\nfrequency');
  lp_resonance_knob = new Knob(150, 230, 25, 0, 20, 10, 'Resonance');
  lp_drywet_slider = drawSlider(0, 350, 120, 0, 1, 0, 0.01, 'Dry/Wet');
  lp_output_slider = drawSlider(90, 350, 120, 0, 1, 0.5, 0.01, 'Output Level');

  // ========== DYNAMIC COMPRESSOR CONTROLS ========== //
  drawBox(220, 100, 250, 400, 'Dynamic Compressor');

  dc_attack_knob = new Knob(260, 190, 25, 0, 1, 0.003, 'Attack');
  dc_knee_knob = new Knob(340, 190, 25, 0, 40, 30, 'Knee');
  dc_release_knob = new Knob(420, 190, 25, 0.01, 1, 0.25, 'Release');
  dc_ratio_knob = new Knob(300, 270, 25, 1, 20, 12, 'Ratio');
  dc_threshold_knob = new Knob(390, 270, 25, -100, 0, -24, 'Threshold');
  dc_drywet_slider = drawSlider(240, 400, 120, 0, 1, 0, 0.01, 'Dry/Wet');
  dc_output_slider = drawSlider(330, 400, 120, 0, 1, 0.5, 0.01, 'Output Level');

  // ============= MASTER VOLUME ============= //
  drawBox(500, 100, 150, 220, 'Master Volume');

  masterVol_slider = drawSlider(490, 220, 160, 0, 1, 1, 0.1, ' ');

  // ============= DELAY ============= //
  drawBox(480, 330, 250, 180, 'Delay');

  delay_drywet_slider = drawSlider(450, 435, 110, 0, 1, 0, 0.01, 'Dry/Wet');
  delay_time_knob = new Knob(570, 440, 25, 0, 1, 0, 'Time');
  delay_feedback_knob = new Knob(640, 440, 25, 0, 0.9, 0.5, 'Feedback');
  delay_output_slider = drawSlider(645, 435, 110, 0, 1, 0.5, 0.01, 'Output lvl');

  // ================ REVERB CONTROLS ================ //
  drawBox(15, 440, 190, 370, 'Reverb');

  rv_duration_knob = new Knob(60, 530, 25, 0, 10, 3, 'Duration');
  rv_decay_knob = new Knob(150, 530, 25, 0, 100, 2, 'Decay');

  rv_reverseButton = setupButton('Reverse', 30, 580, toggleReverse);
  rv_reverseButton.size(150, 35);
  rv_reverseButton.style('border', '1px solid #000000');

  rv_drywet_slider = drawSlider(0, 710, 120, 0, 1, 0, 0.01, 'Dry/Wet');
  rv_output_slider = drawSlider(90, 710, 120, 0, 1, 0.5, 0.01, 'Output Level');

  // ======== WAVESHAPER DISTORTION CONTROLS ======== //
  drawBox(220, 510, 220, 300, 'Waveshaper Distortion');

  wd_amount_knob = new Knob(280, 610, 25, 0, 1, 0, 'Distortion\namount');
  wd_oversample_knob = new Knob(380, 610, 25, 0, 3, 0, 'Oversample');
  wd_drywet_slider = drawSlider(220, 720, 120, 0, 1, 0, 0.01, 'Dry/Wet');
  wd_outputSlider = drawSlider(320, 720, 120, 0, 1, 0.5, 0.01, 'Output Level');

  // ================ SPECTRUM BOXES ================ //
  drawBox(460, 520, 270, 140, 'Spectrum in');
  drawBox(460, 670, 270, 140, 'Spectrum out');

  // add created knobs to array
  knobs.push(
    lp_cutoff_knob,
    lp_resonance_knob,
    dc_attack_knob,
    dc_knee_knob,
    dc_release_knob,
    dc_ratio_knob,
    dc_threshold_knob,
    rv_duration_knob,
    rv_decay_knob,
    wd_amount_knob,
    wd_oversample_knob,
    delay_time_knob,
    delay_feedback_knob
  );
}

/** create audio chain using the given audio source. */
function setupAudioChain() {
  // initialize audio effects
  lp_filter = new p5.Filter('lowpass');
  waveshaperDistort = new p5.Distortion();
  dynamicCompressor = new p5.Compressor();
  reverb = new p5.Reverb();
  masterVol = new p5.Gain();
  delay = new p5.Delay();

  // initialize spectrums
  fftIn = new p5.FFT();
  fftOut = new p5.FFT();

  // set audio source (audio file or mic)
  let inputSource = audioSource === 'audioFile' ? audioFile : mic;

  // setup audio chain
  inputSource.disconnect();
  fftIn.setInput(inputSource); // set input for spectrum in

  lp_filter.disconnect();
  waveshaperDistort.disconnect();
  delay.disconnect();
  dynamicCompressor.disconnect();
  reverb.disconnect();
  masterVol.disconnect();

  // audio -> lowpass -> distortion -> delay -> compressor -> reverb -> master volume
  inputSource.connect(lp_filter);
  lp_filter.connect(waveshaperDistort);
  waveshaperDistort.connect(delay);
  delay.connect(dynamicCompressor);
  reverb.process(inputSource, 5, 2, false);
  dynamicCompressor.connect(reverb);
  reverb.connect(masterVol);
  masterVol.connect();

  fftOut.setInput(masterVol); // set input for spectrum out
  recorder.setInput(masterVol); // set input for recorder
}

/**
 * Creates a button with label.
 * @param {string} name - button label
 * @param {number} posX - x position of button
 * @param {number} posY - y position of button
 * @param {function} onPress - function to call on button press
 * @returns {p5.Element} button
 */
function setupButton(name, posX, posY, onPress) {
  var button = createButton(name);

  button.size(70, 40);
  button.position(posX, posY);
  button.style('background-color', '#ffffff');
  button.addClass('button');
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
  push();
  fill(234, 222, 252);
  strokeWeight(2);
  stroke(166, 151, 189);

  if (!header.includes('Spectrum')) {
    rect(posX, posY, width, height, 10);
    fill(217, 200, 247);
    rect(posX, posY, width, 30, 10, 10, 0, 0);
  } else {
    rect(posX, posY, width, height);
  }

  noStroke();
  textSize(15);
  textStyle(BOLD);
  fill(0);
  header.includes('Spectrum') ? textAlign(LEFT, TOP) : textAlign(CENTER, TOP);
  text(header, posX + width / 2, posY + 8);
  pop();
}

/**
 * Creates a vertical slider with text label on top.
 * @param {number} posX - x position of slider
 * @param {number} posY - y position of slider
 * @param {number} width - width of slider
 * @param {number} minVal - minimum value of slider
 * @param {number} maxVal - maximum value of slider
 * @param {number} value - initial value of slider
 * @param {number} step - step size of slider
 * @param {string} label - slider label
 * @returns {p5.Element} slider
 */
function drawSlider(posX, posY, width, minVal, maxVal, value, step, label) {
  let slider = createSlider(minVal, maxVal, value, step);
  slider.position(posX, posY);
  slider.style('width', width + 'px');
  slider.addClass('slider');

  push();
  fill(0);
  textSize(10);
  textLeading(13);
  textFont('Verdana');
  textAlign(CENTER, BOTTOM);
  text(label, posX + width / 2, posY - width / 2);
  pop();

  return slider;
}

/** function to set parameters for each effect */
function setEffectParams() {
  // lowpass, highpass or bandpass filter
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

  // delay
  delay.delayTime(delay_time_knob.getValue());
  delay.feedback(delay_feedback_knob.getValue());
  delay.drywet(delay_drywet_slider.value());
  delay.amp(delay_output_slider.value());

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
  if (rv_duration_knob.isDragged() || rv_decay_knob.isDragged()) {
    reverb.set(rv_duration_knob.getValue(), rv_decay_knob.getValue(), reverbReversed);
  }
  reverb.drywet(rv_drywet_slider.value());
  reverb.amp(rv_output_slider.value());

  // master volume
  masterVol.amp(masterVol_slider.value());
}

/** function to get current playtime of the track */
function getPlaytime() {
  let total = audioFile.duration();
  let current = audioFile.currentTime();

  // to minutes and seconds
  total = floor(total / 60) + ':' + floor(total % 60);
  current = floor(current / 60) + ':' + floor(current % 60);

  return current + ' / ' + total;
}

/** function to draw playtime */
function drawPlaytime() {
  if (audioSource === 'audioFile') {
    playtime_slider.show();
    playtime_slider.changed(() => audioFile.jump(playtime_slider.value()));
    playtime_slider.value(audioFile.currentTime());
    push();
    fill(240);
    noStroke();
    rect(670, 65, 70, 20, 5);
    fill(0);
    text(getPlaytime(), 675, 80);
    pop();
  } else {
    playtime_slider.hide();
    push();
    fill(240);
    noStroke();
    rect(670, 65, 70, 20, 5);
    fill(0);
    text('🎙️ ON', 678, 80);
    pop();
  }
}

/** function to draw spectrums in and out */
function drawSpectrums() {
  // dimensions of spectrum's container
  let boxWidth = 270,
    boxHeight = 140,
    boxPosX = 460;

  drawBox(boxPosX, 520, boxWidth, boxHeight, 'Spectrum in');
  drawBox(boxPosX, 670, boxWidth, boxHeight, 'Spectrum out');

  let spectrumIn = fftIn.analyze();

  // spectrum in
  push();
  translate(boxPosX, 520);
  fill(16, 137, 224);
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
  translate(boxPosX, 670);
  fill(224, 16, 47);
  noStroke();
  for (let i = 0; i < spectrumOut.length; i++) {
    let x = map(i, 0, spectrumOut.length, 0, boxWidth);
    let h = map(spectrumOut[i], 0, 255, 0, boxHeight);
    rect(x, boxHeight - h, boxWidth / spectrumOut.length, h);
  }
  pop();
}

/** start playing audio */
function playAudio() {
  if (!audioFile.isPlaying()) {
    audioFile.play();
  }
}

/** pause the audio */
function pauseAudio() {
  if (audioFile.isPlaying()) {
    audioFile.pause();
  }
}

/** stop the audio */
function stopAudio() {
  if (audioFile.isPlaying() || audioFile.isPaused()) {
    audioFile.stop();
  }
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

/** skip to (2 seconds before) end of audio */
function toAudioEnd() {
  if (audioFile.isPlaying()) {
    audioFile.jump(audioFile.duration() - 2);
  }
}

/** Toggle recording start and stop */
function toggleRecord() {
  if (!audioFile.isPlaying() && !mic.enabled) return;

  if (!isRecording && recordButton.html() === 'Record') {
    // start recording
    recorder.record(recordedFile);
    recordButton.style('background-color', '#e34b4b');
    recordButton.html('Stop record');
    isRecording = true;
  } else if (isRecording) {
    // stop recording
    recorder.stop();
    recordButton.style('background-color', '#eba991');
    recordButton.html('Save as wav');
    isRecording = false;
  } else if (recordButton.html() === 'Save as wav') {
    // save recorded file
    saveSound(recordedFile, 'recording.wav');
    recordButton.style('background-color', '#ffffff');
    recordButton.html('Record');
  }
}

/** Toggle mic on and off */
function toggleMic() {
  if (!mic.enabled) {
    // stop audio file first
    if (audioFile.isPlaying() || audioFile.isPaused()) audioFile.stop();

    // start mic and use it as input
    mic.start();
    mic.connect();
    audioSource = 'mic';
    // reconnect audio chain with mic as input
    setupAudioChain();
    micButton.style('background-color', '#e34b4b');
    micButton.html('stop mic');
  } else {
    // stop mic and set input back to audio file
    mic.stop();
    mic.disconnect();
    audioSource = 'audioFile';
    // reset audio chain back to audio file as input
    setupAudioChain();
    micButton.style('background-color', '#ffffff');
    micButton.html('mic');
  }
}

function toggleReverse() {
  reverbReversed = !reverbReversed;
  reverb.set(rv_duration_knob.getValue(), rv_decay_knob.getValue(), reverbReversed);
  rv_reverseButton.style('background-color', reverbReversed ? '#dee6ba' : '#ffffff');
}

function mousePressed() {
  // update knob angle when pressed
  knobs.forEach((knob) => knob.mousePressed());
}

function mouseReleased() {
  // stop dragging knob when released
  knobs.forEach((knob) => knob.mouseReleased());
}
