<template>
  <a href="#" ref="top" id="top"><!-- used for scroll to top --></a>
  <BlazingBaton ref="baton" />
  <!--div v-for="(item, idx) in tmpMidiDevices" :key="idx">
      {{ idx }} {{ item }}
  </div-->
  <div class="instrupella">
    <Deck
      v-for="deck in decks"
      :key="deck.index"
      :deck="deck"
      :midiLearn="midiLearn"
      @updateTrack="persistUpdateTrack"
    />
    <div v-if="tracks">
      <a href="#" ref="tracklist" id="tracklist"><!-- used for scroll to tracklist --></a>
      <TrackList
        :tracks="tracks"
      />
    </div>
    <div v-else>
      loading tracklist...
    </div>
    <span
      class="btn btn-primary btn-scroll-to-top"
      v-show="showScrollToTop"
      @click="storage.setScrollToTop(true)">🡅</span>
  </div>
</template>

<script setup>
import { WebMidi } from "webmidi";
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue'
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
const tracklist = ref(null)
const tracks = ref([])
const baton = ref(null)
const tmpMidiDevices = ref([])
const showScrollToTop = ref(false)

const storage = useMainStore()
const decks = computed(() => storage.getDecks)

watch(() => storage.scrollToTop, (value) => {
  if (value === false) {
    return
  }
  // TODO: why does smooth scrolling not work?
  // maybe absolute positioning (body & more) of halfmoon framework is the reason
  // top.value.scrollIntoView({
  //   behavior: 'smooth',
  //   block: 'end'
  // })
  top.value.scrollIntoView(false)
  storage.setScrollToTop(false)
})

watch(() => storage.scrollToTrackList, (value) => {
  if (value === false) {
    return
  }
  // TODO: why does smooth scrolling not work?
  // maybe absolute positioning (body & more) of halfmoon framework is the reason
  tracklist.value.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
  storage.setScrollToTrackList(false)
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
      // check url get params if we have a track to load
      const loadTrack = new URLSearchParams(window.location.search).get('d0')
      if (loadTrack === null) {
        return
      }
      storage.loadTrackByPath(0, loadTrack)
      // TODO: this is incompatible to file:/// protocol
      window.history.pushState({}, null, '/#');
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

const showStickyAlert = (options) => {
    window.halfmoon.initStickyAlert(options)
}

const initMidi = () => {
  webmidi.enable((err) => {
    if (err) {
      tmpMidiDevices.value.push('ERROR: ' + err)
      showStickyAlert({
        content: "WebMidi could not be enabled.",
        alertType: 'alert-danger'
      })
      return
    }
    const midiControllerName = 'DJ2GO2'
    for (const item of WebMidi.inputs) {
      tmpMidiDevices.value.push(item.name)
      if (item.name.toUpperCase().indexOf(midiControllerName) !== -1) {
        midiInput1.value = item
        showStickyAlert({
          content: `MIDI INPUT ${midiControllerName}`,
          alertType: 'alert-success'
        })
      }
    }
    for (const item of WebMidi.outputs) {
      if (item.name.toUpperCase().indexOf(midiControllerName) !== -1) {
        window.tmpMidiOut = item
        showStickyAlert({
          content: `MIDI OUTPUT ${midiControllerName}`,
          alertType: 'alert-success'
        })
      }
    }

    // midiInput1.value = WebMidi.getInputByName('DJ2GO2')
    if (!midiInput1.value) {
      showStickyAlert({
        content: `cant find MIDI ${midiControllerName}`,
        alertType: 'alert-danger'
      })
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

const scrollListener = () => {
  showScrollToTop.value = top.value.getBoundingClientRect().top < 0 ? true : false
}

onMounted(() => {
  loadTrackList()
  storage.clearDecks()
  storage.createDeck()
  initMidi()
  document.querySelector('.content-wrapper').addEventListener('scroll', scrollListener)
})

onBeforeUnmount(() => {
  document.querySelector('.content-wrapper').removeEventListener('scroll', scrollListener)
})

</script>

<style lang="scss">
.btn-scroll-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  cursor: pointer;
}
</style>
