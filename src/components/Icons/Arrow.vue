<template>
  <svg :class="`icon icon-arrow ${additionalClasses}`" width="100%" height="100%"  version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 492.001 492.001" style="enable-background:new 0 0 492.001 492.001;"
	 xml:space="preserve">
	<g>
		<path d="M455.86,262.249L248.976,1.377c-1.46-1.836-4.56-1.836-6.024,0L35.668,262.749c-0.916,1.156-1.084,2.744-0.444,4.072
			c0.64,1.324,1.984,2.176,3.456,2.176h76.592v219.22c0,2.124,2.028,3.784,4.148,3.784h253.604c2.124,0,3.7-1.66,3.7-3.784v-219.22
			h76.512h0.04c2.22,0,3.884-1.716,3.884-3.856C457.16,263.993,456.66,262.957,455.86,262.249z" />
	</g>
  </svg>
</template>

<script setup>
defineProps({
  additionalClasses: {
    type: String,
    default: ''
  }
})
</script>

<style lang="scss">

</style>
