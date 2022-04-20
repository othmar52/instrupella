# instru☻pella
DJ-like web application (VueJs 3) for playing acapellas to synth jam sessions  
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
 - no need for FX because its all done by external hardware
 - managing collection with tempo and beatgrid / downbeat

screenshot of current development status:  
![image](https://user-images.githubusercontent.com/7056051/156877461-259bab79-31ac-49d5-a8a9-265d9e6011bb.png)  

## TODO
### tracklist
  - [ ] iPad BUG when added to home screen the keyboard does not appear on search input (seems to work in chrome) @see [issue #1](https://github.com/othmar52/instrupella/issues/1)
  - [ ] sortable tracklist
  - [x] scroll to top button in tracklist
  - [x] highlight loaded track in tracklist
  - [x] display beat in case its different from 4/4
  - [x] add possibility for prelistening random timestamps (without loading into wavesurfer player)
        ( consider to respect (non)silence )
  - [x] make tracklist browsable by midi controller + sniff audio + load to deck

### database
  - [x] add flag to database for marking tracks with changing tempo/downbeat
  - [x] json export of local storage edited values that can be merged into database
  - [x] add like / dislike to tracks with persisting
  - [ ] persist hotcues, tempo, downbeat
  - [x] apply downbeat for manually persisting downbeat
  - [ ] apply hotcues for manually persisting hotcues
  - [ ] add track relation to db (for listening to original full tracks with beat)?
  - [ ] add genres
  - [ ] add tags to acapella tracks. for example:
    - male
    - female
    - spoken
    - sample(s)
    - with beat
    - with pad
    - vocoder
    - non 4/4

### general
  - [ ] metronome (generic track on 2nd deck)
  - [x] hotcues
  - [x] editable hotcues, tempo, downbeat
  - [x] editable tempo by tap bpm
  - [ ] editable tempo by input field
  - [ ] archive.org sample list
  - [ ] add working demo to https://othmar52.github.io/
  - [x] favicon
  - [ ] settings page (or modal)
  - [x] simplify bpm filter GUI
  - [x] limit bpm filter values to existing tempo's
  - [ ] add incoming midi clock as BPM filter value
  - [ ] switchable wavesurfer backend for timestretch on/off
  - [x] navbar
  - [ ] optional huge pitch slider
  - [x] short project description in README
  - [x] compatibility for any amount of decks
  - [x] show properties of loaded track
  - [x] add filesize as track property
  - [x] vertical centering of icons in buttons
  - [x] volume control
  - [ ] optional sync to midi clock / CV-clock
  - [ ] midi mapping / learn
  - [ ] metronome sound is very quiet on iPad when track is playing - do we need a separate audio context? (not reproduceable in desktop browsers)
  - [x] drop BeatGridPlugin as soon as new version of wavesurfer is released
  - [ ] move github link to "about" modal to avoid leaving instrupella by accident
  - [x] ensure player current time gets updated when seeking on wave-overview during stop (`wavesurfer.audioprocess()` is not fired), maybe use wavesurfer.backend.getPlayedPercents());
  - [ ] ensure very long track titles does not break layout
  - [ ] big wave form position is crazy during play in combination with fast pitch changes
  - [x] BUG volume slider position is not respected on new loaded tracks
  - [x] BUG load new track with different wave zoom -> drag big wave is messed up
  - [x] BUG big wave zoom broken
  - [x] BUG auto scroll to top after load track does not work during play
  - [x] keep wavesurfer instance alive instead of destroying/recreating on every track load
  - [ ] [wavesurfer-BUG](https://github.com/katspaugh/wavesurfer.js/issues/2502) changing volume during mute unmutes the audio
  - [x] BUG clicking track title toggles time format
  - [x] BUG change play state during hot cue hold is not respected on release
  - [x] BUG jogwheel shift functions does not work when track tempo is 0 bpm
  - [x] add reload button to settings in case we have any unresponsiveness due to bugs. consider to pass loaded track as get parameter and auto load this track after reload
  - [ ] ensure track info modal closes when loading a new track
  - [ ] add deck-id to track info modal
  - [ ] optionally include tempo x 2 and tempo / 2 in bpm filter
  - [x] optionally double or half displayed tempo without affecting playback speed
  - [x] clear track minimap when loading a new track. minimap of previous track is shown during load/analyze.@see https://github.com/katspaugh/wavesurfer.js/issues/2479
  - [ ] set hotcue: how to read currentSecond from player within store? audioprocess callback maybe has a few milliseconds offset...

## low prio TODO
  - [ ] drag event on **track overview** for immediate seek during drag
  - [ ] add some kind of delay/easeOut when swiping **big wave** instead of quick stop
  - [ ] improve playback during wave swipe (change playbackRate and length according to swipe move to get vinyl like sound)
  - [ ] choose from several metronome sounds
  - [ ] optional enter url for loading on deck (mp3, youtube, soundcloud, etc.)
  - [x] fix `.pitch-control: { overflow:hidden; }` hack
  - [ ] optional choose local file for loading on deck
  - [ ] multitouch support on iPad
  - [ ] add VU-meter
  - [ ] pre rendering data for waveforms @see https://codepen.io/entonbiba/pen/VPqvME & https://wavesurfer-js.org/faq/


## Resources for development
 - https://vuejs.org/api/
 - https://wavesurfer-js.org/api/index.html
 - https://webmidijs.org/api
 - https://www.gethalfmoon.com/docs/introduction/


## interesting small midi controllers that maybe useful for instrupella
 - https://reverb.com/item/50240054-numark-dj2go2-touch
 - https://reverb.com/item/35995318-numark-dj2go-2
 - numark orbit


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
