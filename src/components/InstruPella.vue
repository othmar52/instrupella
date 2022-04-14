<template>
  <BlazingBaton ref="baton" />
  <a href="#" ref="top" id="top"><!-- used for scroll to top --></a>
  <!--
  <div v-for="(item, idx) in tmpMidiDevices" :key="idx">
      {{ idx }} {{ item }}
  </div>
  -->
  <div class="instrupella">
    <Deck
      v-for="deck in decks"
      :key="deck.index"
      :deck="deck"
      :midiLearn="midiLearn"
      @updateTrack="persistUpdateTrack"
    />
    <div v-if="tracks">
      <TrackList
        :tracks="tracks"
      />
    </div>
    <div v-else>
      loading tracklist...
    </div>
  </div>
</template>

<script setup>
import { WebMidi } from "webmidi";
import { ref, onMounted, computed, watch } from 'vue'
import { useMainStore } from "@/store.js";
import Deck from '@/components/Deck/Deck.vue'
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
const tmpMidiDevices = ref([])

const storage = useMainStore()
const decks = computed(() => storage.getDecks)

watch(() => storage.scrollToTop, (value) => {
  if (value === false) {
    return
  }
  top.value.scrollIntoView({
    behavior: 'smooth',
    block: 'end'
  })
  storage.setScrollToTop(false)
})

const webmidi = WebMidi
const midiInput1 = ref(null)

const persistUpdateTrack = (properties) => {
  storage.addTrackProp(properties)
}

const loadTrackList = () => {
  fetch(`./${process.env.VUE_APP_MUSIC_ABSPATH.split(/\//).pop()}/instrupella/instrupella-db.json`)
    .then(response => response.json())
    .then(json => {
      tracks.value = json.map((track, idx) => ({ ...track, id: idx }))
      mergeLocalStorageTrackProperties()
      storage.setTracks(tracks.value)
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
      tmpMidiDevices.value.push('ERROR: ' + err)
      console.log("WebMidi could not be enabled.", err);
      return
    }
    for (const item of WebMidi.inputs) {
      tmpMidiDevices.value.push(item.name)
    }
    const devices = WebMidi.outputs
    window.tmpMidiOut = WebMidi.outputs[1]
    console.log('WebMidi.outputs', WebMidi.outputs)
    console.log('WebMidi.inputs', WebMidi.inputs)

    // midiInput1.value = WebMidi.getInputByName('DJ2GO2 MIDI 1')
    midiInput1.value = WebMidi.getInputByName('DJ2GO2 MIDI')
    // midiInput1.value = WebMidi.getInputByName('DJ2GO2')
    if (!midiInput1.value) {
      console.log("cant find DJ2GO2 MIDI 1....")
      return
    }
    console.log('midiInput1', midiInput1)

    midiInput1.value.removeListener()
    midiInput1.value.addListener('midimessage', e => {
      switch(e.message.type) {
        case 'clock':
          baton.value.messageClock(e)
          break
        case 'start':
          baton.value.messageStart(e)
          break
        case 'stop':
          baton.value.messageStop(e)
          break
        default:
          storage.handleIncomingMidiEvent(e)
      }
    })
    /*
    midiInput1.value.addListener('noteon', e => {
      console.log('noteon', e);
      storage.fireControlElement(`d.0.hotCueDown`, 2)
    }, {channels: [16]})
    midiInput1.value.addListener('noteoff', e => {
      // console.log('noteon', e);
      storage.fireControlElement(`d.0.hotCueUp`, 2)
    }, {channels: [16]})
    midiInput1.value.addListener('controlchange', e => {
      if(e.message.data[1] === 28) {
        //console.log('controlchange', e.message.data[1], e.message.data[2]*(1/127));
        storage.fireControlElement(`d.0.setVolume`, e.message.data[2]*(1/127))
      }
    }, {channels: [16]})
    */

    //this.outputDN = WebMidi.getOutputByName("Elektron Digitone");
    // TODO add owner check
    //this.localMidi = this.outputDN ? true : false;
  })
  storage.resetMidiMappings()
}

onMounted(() => {
  loadTrackList()
  storage.clearDecks()
  storage.createDeck()
  initMidi()
})

</script>

<style lang="scss">

</style>
