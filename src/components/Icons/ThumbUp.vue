<template>
  <svg :class="`icon icon-thumb-up ${additionalClasses}`" width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.99997 20H17.1919C17.9865 20 18.7058 19.5296 19.0243 18.8016L21.8323 12.3833C21.9429 12.1305 22 11.8576 22 11.5816V11C22 9.89543 21.1045 9 20 9H13.5L14.7066 4.5757C14.8772 3.95023 14.5826 3.2913 14.0027 3.00136V3.00136C13.4204 2.7102 12.7134 2.87256 12.3164 3.3886L8.41472 8.46082C8.14579 8.81044 7.99997 9.23915 7.99997 9.68024V20ZM7.99997 20H2V10H7.99997V20Z" stroke="#000000" stroke-width="0" stroke-linecap="round" stroke-linejoin="round"/>
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
