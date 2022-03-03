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
        <span class="font-size-18">Metronome</span>
        <ButtonIcon
        componentName="IconMetronome"
        :permaClasses="`btn btn-square btn-default btn-lg m-5`"
        :activeClass="(metronameActive) ? 'btn-primary' : ''"
        @click="toggleMetronome"
        />
        <Button
        label="&#x00D7;2"
        :permaClasses="`btn btn-square btn-default btn-lg m-5`"
        :activeClass="(metronameActive) ? 'btn-primary' : ''"
        @click="toggleMetronome"
        />
        <Button
        label="&#247;2"
        :permaClasses="`btn btn-square btn-default btn-lg m-5`"
        :activeClass="(metronameActive) ? 'btn-primary' : ''"
        @click="toggleMetronome"
        />

    <button class="btn btn-default btn-square btn-lg m-5 btn-bars">
        <strong class="bars">TAP</strong><br><span class="text-muted font-size-12 label-bars">BPM</span>
    </button>
    <ButtonIcon
      componentName="IconMinus"
      :permaClasses="`btn btn-square btn-default btn-lg m-5`"
      :activeClass="(metronameActive) ? 'btn-primary' : ''"
      @click="toggleMetronome"
    />
    <ButtonIcon
      componentName="IconPlus"
      :permaClasses="`btn btn-square btn-default btn-lg m-5`"
      :activeClass="(metronameActive) ? 'btn-primary' : ''"
      @click="toggleMetronome"
    />
    </div>
    <div>
    <Button
      label="RESET"
      :permaClasses="`btn btn-square btn-default btn-lg m-5 font-size-12`"
      :activeClass="(metronameActive) ? 'btn-primary' : ''"
      @click="toggleMetronome"
    />
    <Button
      label="APPLY"
      :permaClasses="`btn btn-square btn-default btn-lg m-5 font-size-12`"
      :activeClass="(metronameActive) ? 'btn-primary' : ''"
      @click="toggleMetronome"
    />
    <Metronome :tempo="123" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import ButtonIcon from '@/components/ButtonIcon.vue'
import Button from '@/components/Button.vue'
import Metronome from '@/components/Metronome.vue'
const props = defineProps({
  track: {
    type: Object,
    default: null
  }
})

const metronameActive = ref(false)

const toggleMetronome = () => {
  metronameActive.value = !metronameActive.value
}
const emit = defineEmits([
  'zoomTo'
])

const zoomOut = () => {
  emit('zoomTo', props.pixelPerSecond - 100)
}

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
