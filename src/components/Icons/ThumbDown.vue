<template>
  <svg :class="`icon icon-thumb-down ${additionalClasses}`" width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.99997 4H17.1919C17.9865 4 18.7058 4.47039 19.0243 5.19836L21.8323 11.6167C21.9429 11.8695 22 12.1424 22 12.4184V13C22 14.1046 21.1045 15 20 15H13.5L14.7066 19.4243C14.8772 20.0498 14.5826 20.7087 14.0027 20.9986V20.9986C13.4204 21.2898 12.7134 21.1274 12.3164 20.6114L8.41472 15.5392C8.14579 15.1896 7.99997 14.7608 7.99997 14.3198V14M7.99997 4H2V14H7.99997M7.99997 4V14" stroke="#000000" stroke-width="0" stroke-linecap="round" stroke-linejoin="round"/>
    />
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
