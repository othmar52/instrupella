<template>
  <div class="modal modal-full ie-scroll-fix settings" id="settings" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <a href="#" class="close" role="button" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </a>
            <h5 class="modal-title">Settings</h5>
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
                </ul>
            </p>
            <div class="text-center mt-20"> <!-- text-right = text-align: right, mt-20 = margin-top: 2rem (20px) -->
                <a href="#" class="btn btn-primary" role="button">Close</a>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import IconMusicNote from '@/components/Icons/MusicNote.vue'

const track = ref(null)
const tracks = ref([])

</script>

<style lang="scss">

</style>
