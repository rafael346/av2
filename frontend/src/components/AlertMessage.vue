<template>
  <div class="alert" :class="`alert-${type}`" v-if="message">
    {{ message }}
  </div>
</template>

<script setup>
defineProps({
  message: String,
  type: { type: String, default: 'danger' },
})
</script>
