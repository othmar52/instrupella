<template>
  <div class="edit-track justify-content-between d-flex">
    <div>
        <span class="font-size-18">Set Downbeat</span>
        <button class="btn btn-default btn-square btn-lg m-5 btn-bars">
            <strong class="bars">1</strong><br><span class="text-muted font-size-12 label-bars">bar</span>
        </button>
        <button class="btn btn-default btn-square btn-lg m-5 btn-bars">
            <strong class="bars">4</strong><br><span class="text-muted font-size-12 label-bars">bars</span>
        </button>
        <button class="btn btn-default btn-square btn-lg m-5 btn-bars">
            <strong class="bars">8</strong><br><span class="text-muted font-size-12 label-bars">bars</span>
        </button>
    </div>
    <div>
        <span class="font-size-18">Metronome {{editTempo.toFixed(1)}}</span>
        <ButtonIcon
        componentName="IconMetronome"
        :permaClasses="`btn btn-square btn-default btn-lg m-5`"
        :activeClass="(metronameActive) ? 'btn-primary' : ''"
        @click="toggleMetronome"
        />
        <Button
        label="&#x00D7;2"
        :permaClasses="`btn btn-square btn-default btn-lg m-5`"
        @click="doubleTempo"
        />
        <Button
        label="&#247;2"
        :permaClasses="`btn btn-square btn-default btn-lg m-5`"
        @click="halfTempo"
        />


    <TapBpm
      @tapTempo="setTapTempo"
    />
    <ButtonIcon
      componentName="IconMinus"
      :permaClasses="`btn btn-square btn-default btn-lg m-5`"
      @click="decreaseTempo"
    />
    <ButtonIcon
      componentName="IconPlus"
      :permaClasses="`btn btn-square btn-default btn-lg m-5`"
      @click="increaseTempo"
    />
    </div>
    <div>
    <Button
      label="RESET"
      :permaClasses="`btn btn-square btn-default btn-lg m-5 font-size-12`"
      @click="todo"
    />
    <Button
      label="APPLY"
      :permaClasses="`btn btn-square btn-default btn-lg m-5 font-size-12`"
      @click="todo"
    />
    <Metronome :tempo="editTempo" ref="metronome" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import ButtonIcon from '@/components/ButtonIcon.vue'
import Button from '@/components/Button.vue'
import Metronome from '@/components/Metronome.vue'
import TapBpm from '@/components/Deck/TapBpm.vue'
const props = defineProps({
  track: {
    type: Object,
    default: null
  },
  play: {
    type: Boolean,
    default: false
  },
  playbackRate: {
    type: Number,
    default: 0
  },
  currentSecond: {
    type: Number,
    default: 0
  },
  step: {
    type: Number,
    default: 0.1
  }
})
const editTempo = ref(0)

const metronome = ref(null)
const metronameActive = ref(false)

const toggleMetronome = () => {
  metronameActive.value = !metronameActive.value
}
const doubleTempo = () => {
  editTempo.value *= 2
}

const halfTempo = () => {
  editTempo.value /= 2
}
const increaseTempo = () => {
  editTempo.value += parseFloat(props.step)
}
const decreaseTempo = () => {
  editTempo.value -= parseFloat(props.step)
}

const setTapTempo = (tempo) => {
  editTempo.value = parseFloat(tempo)
}
const emit = defineEmits([
  'todo'
])

const todo = () => {
  emit('todo', 'todo')
}

watch(() => editTempo.value, (newValue) => {
  if (newValue < props.step) {
      newValue = 0
  }
  editTempo.value = parseFloat(newValue)
})

watch(() => props.play, (newPlayState) => {
  if (metronameActive.value === false) {
    return
  }
  metronome.value.play(newPlayState)
})

watch(() => metronameActive.value, (newMetronomeState) => {
  console.log('newMetronomeState', newMetronomeState)
  console.log('props.play', props.play)
  console.log('metronome.value.isPlaying.value', metronome.value.isPlaying.value)
  console.log('metronome.value.isPlaying', metronome.value.isPlaying)
  if (metronameActive.value === false) {
    // ensure metronome is not playing
    metronome.value.play(false)
    return
  }
  if (props.play && metronome.value.isPlaying === false) {
    metronome.value.play(true)
  }
})

</script>

<style lang="scss">
.edit-track {
  .btn-bars {
    position: relative;
    .bars {
        position: absolute;
        top: -0.6rem;
        left: 0;
        width: 5rem;
        text-align: center;
    }
    .label-bars {
        position: absolute;
        top: 1.2rem;
        left: 0;
        width: 5rem;
        text-align: center;
    }
  }
}
</style>
