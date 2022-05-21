<template>
  <Settings />
  <div class="page-wrapper with-navbar">
    <div class="sticky-alerts"></div>
    <nav class="navbar justify-content-between">
      <div class="navbar-content">
        <a href="#settings" class="btn-lg" role="button"><IconCog /></a>
        <a href="#settings" class="btn-lg" role="button"><IconMidiDin /></a>
        <a href="#settings" class="btn-lg" role="button"><IconClock :additionalClasses="`icon-in-text ${getHaveClockDevice ? 'text-success' : ''}`"/></a>
        <span v-if="getHaveClockDevice">
          {{ parseFloat(getExternalClockTempo).toFixed(1) }} BPM
        </span>
        <!--a href="#" :class="`btn-lg ${midiLearn ? 'text-danger' : ''}`" role="button" @click="toggleMidiLearn"><IconMidiLearn /></a-->
      </div>
      <div class="navbar-content">
        <h4 class="navbar-text m-5">INSTRU
          <img alt="Vue logo" src="./assets/instrupella.svg" width="40">
          PELLA
        </h4>
      </div>
      <div class="navbar-content">
        <a href="https://github.com/othmar52/instrupella" class="btn-lg" target="_blank" role="button"><IconGithub /></a>
      </div>
    </nav>
    <div class="content-wrapper">
      <InstruPella
        :midiLearn="midiLearn"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useMainStore } from "@/store.js";
import { useMidiStore } from "@/midistore.js";
import InstruPella from './components/InstruPella.vue'
import Settings from './components/Settings.vue'
import IconCog from './components/Icons/Cog.vue'
import IconMidiLearn from './components/Icons/MidiLearn.vue'
import IconMidiDin from './components/Icons/MidiDin.vue'
import IconClock from './components/Icons/Clock.vue'
import ButtonIcon from './components/ButtonIcon.vue'
import Button from './components/Button.vue'
import IconGithub from './components/Icons/Github.vue'
import NoSleep from 'nosleep.js/src/index.js'

// window.halfmoon = require('halfmoon/js/halfmoon.min.js')
window.halfmoon = require('halfmoon')

// chrome mobile device emulator shows context menu on "touch hold event"
// lets disable this:
window.oncontextmenu = function () { return false }

const settings = ref({})
const storage = useMainStore()
const midistorage = useMidiStore()
const defaultSettings = () => {
  return {
    midi: {
      enable: false,
      device: null,
      mapping: {
        deck0: {
          nudgeAhead: null
        }
      }
    },
    deck0: {
      timestretch: false
    }
  }
}

const toggleMidiLearn = () => {
  storage.toggleMidiLearn()
}

const midiLearn = computed(() => storage.midiLearn)
const getHaveClockDevice = computed(() => midistorage.getHaveClockDevice)
const getExternalClockTempo = computed(() => midistorage.getExternalClockTempo)

onMounted(() => {
  settings.value = defaultSettings()
  const noSleep = new NoSleep()
  noSleep.enable()
})

</script>

<style lang="scss">
@import "halfmoon/css/halfmoon-variables.min.css";

:root {
  --large-button-height: 5rem;
  --content-and-card-spacing: 1.5rem;
}

@media screen and (max-width: 800px) {
  :root {
    --content-and-card-spacing: 0.5rem;
  }
}

.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Opera and Firefox */
}

@media (pointer: coarse) {
  .touchscreen-noselect {
  -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Opera and Firefox */
  }
}

.invisible {
  width: 0;
  height: 0;
  display: none;
}

.icon {
  width: 1rem;
  height: 1rem;
  path,
  polygon,
  rect,
  text {
    fill: var(--dm-button-text-color);
  }
}

.btn-lg .icon {
  width: 1.5rem;
  height: 1.5rem;
  path,
  polygon,
  rect,
  text {
    fill: var(--dm-muted-text-color);
  }
}

.btn-square.btn-rect.btn-lg {
    width: calc(var(--large-button-height)*4);
}

.icon {
  width: 1rem;
  height: 1rem;
  path,
  polygon,
  rect,
  text {
    fill: var(--dm-button-text-color);
  }
}

.icon.icon-in-text {
  width: 1.5rem;
  height: 1.5rem;
  margin-top: 0.8rem;
}

.icon.text-success {
  path,
  polygon,
  rect,
  text {
    fill: var(--success-color);
  }
}
.icon.text-danger {
  path,
  polygon,
  rect,
  text {
    fill: var(--danger-color);
  }
}

.icon-arrow-down {
  transform: rotate(180deg);
}

.text-primary .icon {
  path,
  polygon,
  rect,
  text {
    fill: var(--dm-button-primary-bg-color);
  }
}


.text-danger .icon {
  path,
  polygon,
  rect,
  text {
    fill: var(--dm-button-danger-bg-color);
  }
}


.dark-mode .btn.btn-danger.alt-dm,
.dark-mode .btn.btn-danger.alt-dm:hover {
  color: #ff4d4f !important;
  background-color: #301923;
  background-image: none;
  border-color: #8c0e2e;
  -moz-box-shadow: 0 .2rem 0 rgba(0,0,0,.025);
  -webkit-box-shadow: 0 .2rem 0 rgba(0,0,0,.025);
  box-shadow: 0 .2rem 0 rgba(0,0,0,.025);
}
.modal, .modal-dialog {
    top: -10000%;
}

.break-word {
    -ms-word-break: break-all;
    word-break: break-all;

 /* Non standard for webkit */
     word-break: break-word;

    -webkit-hyphens: auto;
       -moz-hyphens: auto;
        -ms-hyphens: auto;
            hyphens: auto;
}


.backdropped {
  position: fixed;
  top: 0;
  left: 0;
  width: 200%;
  height: 200%;
  background: rgba(0,0,0, 0.6);
  text-align: center;
  overflow: hidden;
  z-index: 1000;
  &>* {
    position: fixed;
    margin: auto;
    font-size: 10vh;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
