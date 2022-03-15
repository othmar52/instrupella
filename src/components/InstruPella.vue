<template>
  <BlazingBaton ref="baton" />
  <a href="#" ref="top" id="top"><!-- used for scroll to top --></a>
  <div class="instrupella">
    <div v-if="tracks">
      <Deck
        :track="track"
        :index="0"
        @updateTrack="persistUpdateTrack"
        :midiLearn="midiLearn"
      />
      <TrackList
        :tracks="tracks"
        @selectTrack="selectTrack"
      />
    </div>
    <div v-else>
      loading tracklist...
    </div>
  </div>
</template>

<script setup>
import { WebMidi } from "webmidi";
import { ref, onMounted } from 'vue'
import { useMainStore } from "@/store.js";
import Deck from '@/components/Deck.vue'
import TrackList from '@/components/TrackList/TrackList.vue'
import BlazingBaton from '@/components/BlazingBaton/BlazingBaton.vue'
const props = defineProps({
  midiLearn: {
    type: Boolean,
    default: false
  }
})
console.log('webmidi', WebMidi)
const track = ref(null)
const top = ref(null)
const tracks = ref([])
const baton = ref(null)

const storage = useMainStore()
const webmidi = WebMidi
const midiInput1 = ref(null)
const selectTrack = (trackIndex) => {
  top.value.scrollIntoView({
    behavior: 'auto',
    block: 'end'
  })
  setTimeout(() => { track.value = tracks.value[trackIndex] }, 200)
}

// how to persist edit's (tempo, downbeat, hotcues)?
// maybe local storage?
// or is it really necessary to use a database?
//   case yes - does it make sense to use mpd?
// for now simply set tracks.track prop without persisting...

const persistUpdateTrack = (properties) => {
  console.log('TODO: persist update track', properties)
  storage.addTrackProp(properties)
  for (const [key, value] of Object.entries(properties)) {
    track.value[key] = value
  }
}

const loadTrackList = () => {
  fetch(`./${process.env.VUE_APP_MUSIC_ABSPATH.split(/\//).pop()}/00-acajam.json`)
    .then(response => response.json())
    .then(json => {
      tracks.value = json.map((track, idx) => ({ ...track, id: idx }))
      mergeLocalStorageTrackProperties()
    })
}

const mergeLocalStorageTrackProperties = () => {
  for (const trackProps of storage.getAllTrackProps) {
    const index = tracks.value.findIndex(item => item.path === trackProps.path)
    if (index === -1) {
      continue
    }
    for (const [key, value] of Object.entries(trackProps)) {
      tracks.value[index][key] = value
    }
  }
}

const initMidi = () => {
  webmidi.enable((err) => {
    if (err) {
      console.log("WebMidi could not be enabled.", err);
      return
    }
    const devices = WebMidi.outputs;
    console.log('WebMidi.outputs', WebMidi.outputs)
    console.log('WebMidi.inputs', WebMidi.inputs)

    midiInput1.value = WebMidi.getInputByName('Control Hub MIDI 1')
    if (!midiInput1.value) {
      console.log("cant find Control Hub MIDI 1....")
      return
    }
    console.log('midiInput1', midiInput1)

    /*
    midiInput1.value.addListener('midimessage', e => {
      console.log('midimessage', e);
    })
    */
    midiInput1.value.removeListener()
    midiInput1.value.addListener('clock', e => {
      // console.log('clock', e);
      baton.value.messageClock(e)
    })
    midiInput1.value.addListener('start', e => {
      // console.log('start', e);
      baton.value.messageStart(e)
    })
    midiInput1.value.addListener('stop', e => {
      // console.log('stop', e);
      baton.value.messageStop(e)
    })

    //this.outputDN = WebMidi.getOutputByName("Elektron Digitone");
    // TODO add owner check
    //this.localMidi = this.outputDN ? true : false;
  })
}

onMounted(() => {
  loadTrackList()
  initMidi()
})

</script>

<style lang="scss">

</style>
