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
    <v-file-input accept="audio/*" 
                  label="Select file (any audio format)" 
                  v-model="file">
    </v-file-input>
    <v-btn icon large fab color="indigo" @click="upload">Go!</v-btn>
  </div>
</template>

<script>
import {Howl} from 'howler'
export default {

  data () {
    return {
      file: null
    }
  },

  methods: {
    play() {
      this.$store.dispatch('play')
    },
    pause() {
      this.$store.dispatch('pause')
    },
    stop() {
      this.$store.dispatch('stop')
    },
    upload() {
      
      const file = this.file
      const reader = new FileReader()
      const store = this.$store
      reader.addEventListener('load', function() {
        const data = reader.result
        const howl = new Howl({
          'src': data,
          'html5': true,
          'autoplay': false,
        })
        store.dispatch('upload', {howl: howl, file: file})
      })
      reader.readAsDataURL(file)
    }
      
  }
}
</script>