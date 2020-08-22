<template>
  <v-btn large right @click="play">
    PLAY
  </v-btn>
</template>

<script>
export default {
  methods: {
    play() {
      this.$store.dispatch('play')
    }
  }
}
</script>