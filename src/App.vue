<template>
  <Settings />
  <div class="page-wrapper with-navbar">
    <nav class="navbar justify-content-between">
      <div class="navbar-content">
        <a href="#settings" class="btn-lg" role="button"><IconCog /></a>
        <a href="#settings" class="btn-lg" role="button"><IconMidiDin /></a>
        <a href="#settings" class="btn-lg" role="button"><IconClock /></a>
        <a href="#" :class="`btn-lg ${midiLearn ? 'text-danger' : ''}`" role="button" @click="toggleMidiLearn"><IconMidiLearn /></a>
      </div>
      <div class="navbar-content">
        <h4 class="navbar-text text-monoXspace m-5">INSTRU
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
import InstruPella from './components/InstruPella.vue'
import Settings from './components/Settings.vue'
import IconCog from './components/Icons/Cog.vue'
import IconMidiLearn from './components/Icons/MidiLearn.vue'
import IconMidiDin from './components/Icons/MidiDin.vue'
import IconClock from './components/Icons/Clock.vue'
import ButtonIcon from './components/ButtonIcon.vue'
import Button from './components/Button.vue'
import IconGithub from './components/Icons/Github.vue'

// window.halfmoon = require('halfmoon/js/halfmoon.min.js')
window.halfmoon = require('halfmoon')

// chrome mobile device emulator shows context menu on "touch hold event"
// lets disable this:
window.oncontextmenu = function () { return false }

const settings = ref({})
const storage = useMainStore()
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

onMounted(() => {
  settings.value = defaultSettings()
})

</script>

<style lang="scss">
@import "halfmoon/css/halfmoon-variables.min.css";

:root {
  --large-button-height: 5rem;
  --content-and-card-spacing: 1.5rem;
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
</style>
