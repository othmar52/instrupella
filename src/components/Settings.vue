<template>
  <div class="modal modal-full ie-scroll-fix settings" id="settings" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <a href="#" class="close" role="button" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </a>
            <h5 class="modal-title">Settings</h5>
            <div class="text-center mt-20">
                <span @click="reloadInstrupella" class="btn btn-danger m-10" role="button">Reload instru☻pella</span>
                <a href="#" class="btn btn-default" role="button">Close settings</a>
            </div>
            <p>Viewport dimensions:
              <strong>{{wW}}</strong>
              <span class="text-muted"> x </span>
              <strong>{{wH}}</strong>
              <span class="text-muted"> px</span>
            </p>
            <div class="custom-switch">
                <input type="checkbox" id="switch-1" value="">
                <label for="switch-1">timestretch <IconMusicNote /></label>
            </div>
            <p>
                <strong>TODO:</strong> add settings
                <ul>
                    <li>pitch in-/decrement step size</li>
                    <li>nudge in-/deincrement duration</li>
                    <li>amount of decks</li>
                    <li>midi control</li>
                    <li>reload instrupella or at least re-init player if it stucks</li>
                    <li>default time formatting MM:SS or SSS.123  elapsed/remaining </li>
                    <li>auto change bpm filter of track search on icoming midi clock </li>
                    <li>show/hide volume control </li>
                </ul>
            </p>
            <div class="text-center mt-20" v-if="storage.getAllTrackProps.length > 0"> <!-- text-right = text-align: right, mt-20 = margin-top: 2rem (20px) -->
                <label>Track edits ({{storage.getAllTrackProps.length}})</label>
                <span @click="downloadTrackEdits" class="btn btn-primary m-10" role="button">Download</span>
                <span @click="storage.clearTrackProps()" class="btn btn-danger m-10" role="button">Clear</span>
            </div>
            <div class="text-center mt-20">
                <a href="#" class="btn btn-default" role="button">Close settings</a>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import IconMusicNote from '@/components/Icons/MusicNote.vue'
import downloadMixin from '../mixins/utils/download'
import { useMainStore } from '@/store.js'

const storage = useMainStore()
const { download } = downloadMixin()
const wW = computed(() => window.innerWidth)
const wH = computed(() => window.innerHeight)

const downloadTrackEdits = () => {
  download(
    JSON.stringify(storage.getAllTrackProps, null, 2),
    'application/json;charset=utf-8',
    `trackprops-${
    new Date()
      .toISOString()
      .replaceAll('T', '.')
      .replaceAll(':', '-')
      .substring(0, 16)}.json`
  )
}

const reloadInstrupella = () => {
  // TODO: add tracks of all decks to reload
  // but currently we have only one deck...

  // TODO: this is incompatible to file:/// protocol
  if (storage.getDecks[0].track === null) {
    document.location.href= "/"
    return
  }
  const trackArgument = encodeURIComponent(storage.getDecks[0].track.path)
  document.location.href= `/?d0=${trackArgument}`
}

</script>

<style lang="scss">

</style>
