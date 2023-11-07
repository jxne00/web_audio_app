# TODO

**The functionality of the application should meet the following requirements:**

- [ ] The application should include the playback controls and effects controls shown in Image 1.

- [ ] Internally, the effects must be connected in a chain, as shown in Image 2.

- [ ] The application should include a Record button that allows the user to start/stop recording the processed signal as a WAV file.

- [ ] The application must display both the spectrum of the original sound and the spectrum of the processed sound.

**Ideas for further development:**

- [ ] Enhance the filter effect by adding a type selector that allows the user to select between a low-pass, high-pass or band-pass filter.

- [ ] Allow the user to select between the live microphone input and the pre-recorded audio file as the audio source for the application.

- [ ] Configure a delay audio effect and add this to the audio chain before the dynamic compressor.


## Filter params

- Low-Pass: https://p5js.org/reference/#/p5.Filter
- Dynamic Compressor: https://p5js.org/reference/#/p5.Compressor/set
- Waveshaper Distortion: https://p5js.org/reference/#/p5.Distortion
- Reverb: https://p5js.org/reference/#/p5.Reverb, https://p5js.org/reference/#/p5.Reverb/set
- Drywet: https://p5js.org/reference/#/p5.Effect/drywet
