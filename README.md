# instru☻pella
DJ-like web application for playing acapellas to synth jam sessions  
It's similar to traktor or serato but with very limited functionality  

## GOAL
having another "instrument" next to dozens of synthesizers, drum machines, etc. that can only play acapellas/vocal samples. it should be very easy to perform in perfect sync without paying too much attention to it. 

## why not use any existing DJ app?
After trying dozens of dj apps i did not find any that met my requirements
 - play/perform acapella tracks or parts of it perfectly in sync to any music
 - useable on touchscreen/iPad (i do have timcode vinyl but its really an overhead for such a dummy task)
 - precise control for pitching
 - precise control for nudging
 - no need for multiple decks because the syncing is against live performed music
 - managing collection with tempo and beatgrid / downbeat

outdated screenshot:  
![image](https://user-images.githubusercontent.com/7056051/156348316-63c6df06-a430-4ae7-bb95-c812d8ff35ee.png)  

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
  - [ ] metronome sound is very quiet on iPad when track is playing - do we need a separate audio context? (not reproduceable in desktop browsers)
  - [ ] drop BeatGridPlugin as soon as new version of wavesurfer is released
  - [ ] add like / dislike to tracks with persisting
  - [ ] move github link to "about" modal to avoid leaving instrupella by accident
  - [ ] ensure player current time gets updated when seeking on wave-overview during stop
  - [ ] ensure very long track titles does not breal layout
  - [ ] big wave form position is crazy during play in combination with fast pitch changes
  - [ ] BUG volume slider position is not respected on new loaded tracks 
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
