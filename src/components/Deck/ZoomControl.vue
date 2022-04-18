<template>
  <div class="zoom-control">
    <ButtonIcon
      componentName="IconMinus"
      :permaClasses="`btn btn-square btn-default m-5`"
      :activeClass="(deck.pixelPerSecond === 50) ? 'disabled' : ''"
      @click="storage.zoomOut(deck.index)"
    />
    <ButtonIcon
      componentName="IconPlus"
      :permaClasses="`btn btn-square btn-default m-5`"
      :activeClass="(deck.pixelPerSecond === 700) ? 'disabled' : ''"
      @click="storage.zoomIn(deck.index)"
    />
  </div>
</template>

<script setup>
import ButtonIcon from '@/components/ButtonIcon.vue'
import { useMainStore } from "@/store.js";
const storage = useMainStore()

const props = defineProps({
  deck: {
    type: Object
  }
})

</script>