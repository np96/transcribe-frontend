<template>
  <div class="text-center">
    <v-btn icon large fab color="indigo" @click="play">
      <v-icon>mdi-play-circle-outline</v-icon>
    </v-btn>
    <v-btn icon large fab color="indigo" @click="pause">
      <v-icon>mdi-pause-circle-outline</v-icon>
    </v-btn>
    <v-btn icon large fab color="indigo" @click="stop">
      <v-icon>mdi-stop-circle-outline</v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  methods: {
    play() {
      this.$store.dispatch('play')
      this.$store.dispatch('getWaveform')
    },
    pause() {
      this.$store.dispatch('pause')
    },
    stop() {
      this.$store.dispatch('stop')
    }
  }
}
</script>