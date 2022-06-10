<template>
<div class="container-fluid noselect">
  <div class="row">
    <div class="col-9">
      <div :class="`card p-0 deck deck-${deck.index}`">
        <TrackMeta
          :deck="deck"
        />
        <ZoomControl :deck="deck" />
        <div class="wave-big-wrap">
          <Transition name="slide-fade">
            <div class="text-center align-middle" v-if="loadProgress <= 100 && trackAnalyzed === false">
              <div class="load-track" v-if="loadProgress >0 && loadProgress < 100">
                <h3>Loading</h3>
                <div class="progress">
                  <div class="progress-bar" role="progressbar" :style="`width: ${loadProgress}%`" :aria-valuenow="loadProgress" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
              </div>
              <div class="analyze-track" v-if="loadProgress === 100 && trackAnalyzed === false">
                <h3><br class="todo-remove-me" />Analyzing Track...</h3>
              </div>
            </div>
          </Transition>
          <WaveBig
            :deck="deck"
            ref="player"
            class="wave-big"
            @trackLoad="trackLoad"
            @waveformReady="waveformReady"
            @trackReady="trackReady"
            @error="error"
          />
        </div>
        <div class="d-flex">
          <ButtonIcon
            title="Edit tempo and downbeat of track"
            componentName="IconDownbeat"
            :permaClasses="`${buttonClasses}`"
            :activeClass="showEditTrack ? 'btn-primary' : ''"
            :midiLearn="midiLearn"
            @click="toggleEditTrack"
          />
          <ButtonIcon
            componentName="IconArrowToFirst"
            :permaClasses="`${buttonClasses} mr-0 ${midistorage.getAdditionalClassForGuiElement('d.'+deck.index+'.toBegin')}`"
            :midiLearn="midiLearn"
            @click="storage.fireControlElement(`d.${deck.index}.seekToSecond`, 0)"
          />
          <div :id="`deck-minimap${deck.index}`" class="deck-minimap m-10 ml-0"></div>
          <ButtonIcon
            :componentName="deck.play ? 'IconPause' : 'IconPlay'"
            :permaClasses="`${buttonClasses}`"
            :activeClass="deck.play ? 'btn-primary' : ''"
            :midiLearn="midiLearn"
            @click="storage.fireControlElement(`d.${deck.index}.togglePlay`)"
          />
          <ButtonIcon
            componentName="IconMinus"
            :permaClasses="`rounded-circle ${buttonClasses} ${midistorage.getAdditionalClassForGuiElement('d.'+deck.index+'.nudgeBehind')}`"
            :midiLearn="midiLearn"
            @click="storage.fireControlElement(`d.${deck.index}.nudgeBehind`)"
          />
          <ButtonIcon
            componentName="IconPlus"
            :permaClasses="`rounded-circle ${buttonClasses} ${midistorage.getAdditionalClassForGuiElement('d.'+deck.index+'.nudgeAhead')}`"
            :midiLearn="midiLearn"
            @click="storage.fireControlElement(`d.${deck.index}.nudgeAhead`)"
          />
          <ButtonIcon
            componentName="IconMute"
            :permaClasses="`${buttonClasses}`"
            :activeClass="deck.mute ? 'btn-danger' : ''"
            :midiLearn="midiLearn"
            @click="storage.fireControlElement(`d.${deck.index}.toggleMute`)"
          />
          <Button
            label="SYNC"
            :permaClasses="`${buttonClasses}`"
            :activeClass="deck.sync ? 'btn-primary' : ''"
            @click="storage.fireControlElement(`d.${deck.index}.toggleSync`)"
          />
        </div>
      </div>
    </div>
    <div class="col-3">
      <div class="card pitch-volume-card d-flex justify-content-between">
        <SyncControl
          @pitchChange="setPitch"
          :midiLearn="midiLearn"
          :deck="deck"
          v-if="deck.sync"
        />
        <PitchControl
          @pitchChange="setPitch"
          :midiLearn="midiLearn"
          :deck="deck"
          v-else
        />
        <VolumeControl
          :midiLearn="midiLearn"
          :deck="deck"
        />
      </div>
    </div>
  </div>
  <div class="row" v-if="showEditTrack">
    <div class="col-12">
      <div class="card">
        <Edit
          :track="deck.track"
          :play="deck.play"
          :playbackRate="deck.playbackRate"
          :currentSecond="deck.currentSecond"
          @updateTrack="$emit('updateTrack', $event)"
          @changedMuteChannel="changeMuteChannel($event)"
        />
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col-6">
      <div class="card">
        <HotCues
          :deck="deck"
          :track="deck.track"
          :play="deck.play"
          :currentSecond="deck.currentSecond"
          :midiLearn="midiLearn"
        />
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref } from 'vue'
import TrackMeta from '@/components/TrackMeta.vue'
import ZoomControl from '@/components/Deck/ZoomControl.vue'
import WaveBig from '@/components/WaveBig.vue'
import Button from '@/components/Button.vue'
import ButtonIcon from '@/components/ButtonIcon.vue'
import PitchControl from '@/components/PitchControl.vue'
import SyncControl from '@/components/SyncControl.vue'
import VolumeControl from '@/components/VolumeControl.vue'
import Edit from '@/components/Deck/Edit.vue'
import HotCues from '@/components/HotCues.vue'
import { useMainStore } from "@/store.js";
import { useMidiStore } from "@/midistore.js";
const player = ref(null)
const play = ref(false)
const mute = ref(false)
const playbackRate = ref(1)
const loadProgress = ref(0)
const trackAnalyzed = ref(false)
const currentSecond = ref(0)
const showEditTrack = ref(false)
const buttonClasses = ref('btn btn-square btn-default btn-lg m-10')
const storage = useMainStore()
const midistorage = useMidiStore()
const props = defineProps({
  deck: {
    type: Object,
    default: null
  },
  midiLearn: {
    type: Boolean,
    default: false
  }
})

const toggleEditTrack = () => {
  showEditTrack.value = !showEditTrack.value
}
const setPitch = (newPitchValue) => {
  playbackRate.value = newPitchValue
}
const trackLoad = (percent) => {
  loadProgress.value = percent
  trackAnalyzed.value = false
}
const trackReady = () => {
  trackAnalyzed.value = true
  storage.analyzeTrackPostHook(props.deck.index)
}
const waveformReady = () => {
  trackAnalyzed.value = true
  storage.analyzeTrackPostHook(props.deck.index)
}
const changeMuteChannel = (channelIndex) => {
  props.deck.muteAudioChannel = channelIndex
}
const error = (errormsg) => {
  console.log('TODO: handle player error', errormsg)
}
</script>

<style lang="scss">
@import "../../scss/_variables.scss";
.deck {
  .wave-big-wrap {
    height: 150px;
    background: #111417;
  }
  .wave-dragger {
    z-index: 7;
  }
  .wave-big {
    width: 100%;
    display: inline-block;
  }
  .wave-timeline {
    width: 100%;
    display: inline-block;
  }
  .zoom-control {
    position: absolute;
    z-index: 8;
  }
}
.deck-minimap {
  width: 50%;
  height: var(--large-button-height);
  background: $waveFormBackground;
}

.load-track,
.analyze-track {
  position: absolute;
  padding: 3rem auto 0;
  text-align: center;
  width: 100%;
}
.slide-fade-enter-active {
  transition: all 0.1s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}
</style>
