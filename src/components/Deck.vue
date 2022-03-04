<template>
<div class="container-fluid noselect">
  <div class="row">
    <div class="col-10">
      <div :class="`card p-0 deck deck-${index}`">
        <TrackMeta
          :track="track"
          :currentSecond="currentSecond"
          :playbackRate="playbackRate"
        />
        <ZoomControl :pixelPerSecond="pixelPerSecond" @zoomTo="zoomTo" />
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
            :track="track"
            :play="play"
            :mute="mute"
            :playbackRate="playbackRate"
            :pixelPerSecond="pixelPerSecond"
            :editTempo="editTempo"
            @trackEnd="trackEnd"
            @trackLoad="trackLoad"
            @waveformReady="waveformReady"
            @trackReady="trackReady"
            @audioprocess="audioprocess"
            ref="player"
            class="wave-big"
          />
        </div>
        <div class="d-flex">
          <ButtonIcon
            title="Edit tempo and downbeat of track"
            componentName="IconDownbeat"
            :permaClasses="`${buttonClasses}`"
            :activeClass="showEditTrack ? 'btn-primary' : ''"
            @click="toggleEditTrack"
          />
          <ButtonIcon
            componentName="IconArrowToFirst"
            :permaClasses="`${buttonClasses} mr-0`"
            @click="$refs.player.seekZero()"
          />
          <div id="deck-minimap" class="deck-minimap m-10 ml-0"></div>
          <ButtonIcon
            :componentName="play ? 'IconPause' : 'IconPlay'"
            :permaClasses="`${buttonClasses}`"
            :activeClass="play ? 'btn-primary' : ''"
            @click="togglePlay"
          />
          <ButtonIcon
            componentName="IconMinus"
            :permaClasses="`rounded-circle ${buttonClasses}`"
            @click="$refs.player.nudgeBehind()"
          />
          <ButtonIcon
            componentName="IconPlus"
            :permaClasses="`rounded-circle ${buttonClasses}`"
            @click="$refs.player.nudgeAhead()"
          />
          <ButtonIcon
            componentName="IconMute"
            :permaClasses="`${buttonClasses}`"
            :activeClass="mute ? 'btn-danger' : ''"
            @click="toggleMute"
          />
        </div>
        <br />

      </div>
    </div>
    <div class="col-2">
      <div class="card">
        <PitchControl @pitchChange="setPitch" />
      </div>
    </div>
  </div>
  <div class="row" v-if="showEditTrack">
    <div class="col-12">
      <div class="card">
        <Edit
          :track="track"
          :play="play"
          :playbackRate="playbackRate"
          :currentSecond="currentSecond"
          @updateTrack="$emit('updateTrack', $event)"
          @newEditTempo="newEditTempo"
        />
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col-6">
      <div class="card">
        <HotCues
          :track="track"
          :play="play"
          :currentSecond="currentSecond"
          @hotCuesChange="hotCuesChange"
          @seekToAndPlay="seekToAndPlay"
          @seekToAndStop="seekToAndStop"
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
import Edit from '@/components/Deck/Edit.vue'
import HotCues from '@/components/HotCues.vue'
const player = ref(null)
const play = ref(false)
const mute = ref(false)
const pixelPerSecond = ref(400)
const playbackRate = ref(1)
const loadProgress = ref(0)
const trackAnalyzed = ref(false)
const currentSecond = ref(0)
const showEditTrack = ref(false)
const editTempo = ref(0)
const buttonClasses = ref('btn btn-square btn-default btn-lg m-10')

defineProps({
  index: {
    type: Number,
    default: 0
  },
  track: {
    type: Object,
    default: null
  }
})
const togglePlay = () => {
  play.value = !play.value
}
const toggleMute = () => {
  mute.value = !mute.value
}
const toggleEditTrack = () => {
  showEditTrack.value = !showEditTrack.value
}
const setPitch = (newPitchValue) => {
  playbackRate.value = newPitchValue
}

const trackEnd = () => {
  play.value = false
  mute.value = false
}
const trackLoad = (percent) => {
  loadProgress.value = percent
  play.value = false
  mute.value = false
  trackAnalyzed.value = false
}
const trackReady = () => {
  trackAnalyzed.value = true
}
const waveformReady = () => {
  trackAnalyzed.value = true
}
const zoomTo = (pxPerSec) => {
  pixelPerSecond.value = pxPerSec
}
const audioprocess = (sec) => {
  currentSecond.value = sec
}
const newEditTempo = (newTempo) => {
  editTempo.value = newTempo
}

const seekToAndPlay = (second) => {
  player.value.seekToSecondAndCenter(second)
  player.value.forcePlay()
}

const seekToAndStop = (second) => {
  player.value.seekToSecondAndCenter(second)
  player.value.forceStop()
}

const hotCuesChange = (allHotCues) => {
  player.value.updateMarkers(allHotCues)
}

</script>

<style lang="scss">
@import "../scss/_variables.scss";
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
