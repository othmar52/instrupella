# instrupella
DJ-like web application for playing acapellas to synth jam sessions  
It's similar to traktor or serato but with very limited functionality  

After trying dozens of dj apps i did not find any that met my requirements
 - play/perform acapella tracks or parts of it perfectly in sync to any music
 - useable on touchscreen/iPad (i do have timcode vinyl but its really an overhead for such a dummy task)
 - precise control for pitching
 - precise control for nudging
 - no need for multiple decks because the syncing is against live performed music
 - managing collection with tempo and beatgrid
 - having another "instrument" next to dozens of synthesizers that can only play acapellas/vocal samples

screenshot of current development status:  
![image](https://user-images.githubusercontent.com/7056051/156877461-259bab79-31ac-49d5-a8a9-265d9e6011bb.png)  

## TODO
  - [ ] iPad BUG when added to home screen the keyboard does not appear on search input (seems to work in chrome) @see [issue #1](https://github.com/othmar52/instrupella/issues/1)
  - [ ] sortable tracklist
  - [ ] metronome (generic track on 2nd deck)
  - [x] hotcues
  - [x] editable hotcues, tempo, downbeat
  - [x] editable tempo by tap bpm
  - [ ] editable tempo by input field
  - [ ] persist hotcues, tempo, downbeat
  - [ ] archive.org sample list
  - [x] favicon
  - [ ] settings page (or modal)
  - [x] simplify bpm filter GUI
  - [x] limit bpm filter values to existing tempo's
  - [ ] add incoming midi clock as BPM filter value
  - [ ] switchable wavesurfer backend for timestretch on/off
  - [x] navbar
  - [ ] optional huge pitch slider
  - [x] short project description in README
  - [ ] scroll to top button in tracklist
  - [ ] compatibility for any amount of decks
  - [ ] show properties of loaded track
  - [x] vertical centering of icons in buttons
  - [x] volume control
  - [ ] optional sync to midi clock
  - [ ] midi mapping / learn
  - [ ] metronome sound is very quiet when track is playing - do we need a separate audio context?
  - [ ] drop BeatGridPlugin as soon as new version of wavesurfer is released
  - [ ] add like / dislike to tracks with persisting
  - [ ] move github link to "about" modal
  - [ ] ensure player current time gets updated when seeking on wave-overview during stop
  - [ ] ensure very long track titles does not breal layout
  - [ ] big wave form position is crazy during fast pitch
  - [ ] BUG load new track with different wave zoom -> drag big wave is messed up

## low prio TODO
  - [ ] drag event on **track overview** for immediate seek during drag
  - [ ] add some kind of delay when swiping **big wave** instead of quick stop
  - [ ] improve playback during wave swipe (change playbackRate and length according to swipe move to get vinyl like sound)
  - [ ] choose from several metronome sounds
  - [ ] optional enter url for loading on deck
  - [x] fix `.pitch-control: { overflow:hidden; }` hack
  - [ ] optional choose local file for loading on deck
  - [ ] multitouch on iPad
  - [ ] add VU-meter
  - [ ] pre rendering data for waveforms @see https://codepen.io/entonbiba/pen/VPqvME & https://wavesurfer-js.org/faq/

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
